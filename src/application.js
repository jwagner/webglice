jQuery(function(){

provides('main');

var sceneGraph;

var GRID_RESOLUTION = 1024,
    GRID_SIZE = 512,
    FAR_AWAY = 10000,
    scene = requires('scene'),
    mesh = requires('mesh'),
    Loader = requires('loader').Loader,
    ShaderManager = requires('shader').Manager,
    glUtils = requires('glUtils'),
    uniform = requires('uniform'),
    Clock = requires('clock').Clock,
    MouseController = requires('cameracontroller').MouseController,
    InputHandler = requires('input').Handler,
    canvas = document.getElementById('c'),
    clock = new Clock(),
    input = new InputHandler(canvas),
    loader = new Loader(),
    resources = loader.resources,
    shaderManager = new ShaderManager(resources),
    time = 0,
    globalUniforms,
    controller;

function prepareScene(){
    sceneGraph = new scene.Graph();

    var vbo = new glUtils.VBO(mesh.grid(GRID_RESOLUTION)),
        waterVBO = new glUtils.VBO(mesh.grid(100)),
        heightmapTexture = new glUtils.Texture2D(resources['gfx/heightmap.png']),
        normalnoiseTexture = new glUtils.Texture2D(resources['gfx/normalnoise.png']),
        mountainShader = shaderManager.get('heightmap.vertex', 'terrain.frag'),
        waterShader = shaderManager.get('water'),
        postShader = shaderManager.get('screen.vertex', 'tonemapping.frag'),
        skyShader = shaderManager.get('transform.vertex', 'sky.frag'),
        mountainTransform, waterTransform, flipTransform;
    globalUniforms = {
        skyColor: new uniform.Vec3([0.1, 0.15, 0.45]),
        // looks sexy for some reason
        groundColor: new uniform.Vec3([-0.025, -0.05, -0.1]),
        sunColor: new uniform.Vec3([0.7*2, 0.6*2, 0.75*2]),
        sunDirection: new uniform.Vec3([0.577, 0.277, 0.077]),
        time: time,
        clip: 1000
    };

    vec3.normalize(globalUniforms.sunDirection.value);


    var mountain = new scene.Material(mountainShader, {
                heightmap: heightmapTexture
            }, [
            mountainTransform = new scene.Transform([
                new scene.SimpleMesh(vbo)
            ])
        ]),
        sky = new scene.Transform([
            new scene.Skybox(skyShader, {
                horizonColor: new uniform.Vec3([0.3, 0.6, 1.2]),
                zenithColor: new uniform.Vec3([0.05, 0.2, 0.8])
            })
        ]);

        // can be optimized with a z only shader
    var mountainDepthFBO = new glUtils.FBO(1024, 1024, gl.FLOAT),
        mountainDepthTarget = new scene.RenderTarget(mountainDepthFBO, [
            new scene.Uniforms({clip: 0.2}, [
                mountain
            ])
        ]),
        reflectionFBO = new glUtils.FBO(512, 512, gl.FLOAT),
        reflectionTarget = new scene.RenderTarget(reflectionFBO, [
            new scene.Uniforms({clip: 0.2}, [
                flipTransform = new scene.Transform([mountain, sky])
            ])
        ]),
        water = new scene.Material(waterShader, {
                color: new uniform.Vec3([0.05, 0.1, 0.2]),
                reflection: reflectionFBO,
                refraction: mountainDepthFBO,
                normalnoise: normalnoiseTexture
            }, [
                waterTransform = new scene.Transform([
                    new scene.SimpleMesh(waterVBO)
                ])
            ]);
        combinedFBO = new glUtils.FBO(1024, 1024, gl.FLOAT),
        combinedTarget = new scene.RenderTarget(combinedFBO, [mountain, water, sky]);

    var camera = new scene.Camera([
            new scene.Uniforms(globalUniforms, [
                mountainDepthTarget,
                reflectionTarget,
                combinedTarget
            ])
        ]),
        postprocess = new scene.Postprocess(postShader, {
            texture: combinedFBO,
        });

 //   mountainTransform.debug = true;

    camera.position[1] = 30;

    mat4.translate(mountainTransform.matrix, [-0.5*GRID_SIZE, -50, -0.5*GRID_SIZE]);
    mat4.scale(mountainTransform.matrix, [GRID_SIZE, 100, GRID_SIZE]);

    mat4.scale(flipTransform.matrix, [1, -1, 1]);

    mat4.translate(waterTransform.matrix, [-FAR_AWAY, 0, -FAR_AWAY]);
    mat4.scale(waterTransform.matrix, [FAR_AWAY*2, 1, FAR_AWAY*2]);

    mat4.scale(sky.matrix, [FAR_AWAY, FAR_AWAY, FAR_AWAY]);

    camera.far = FAR_AWAY*2;

    sceneGraph.root.append(camera);
    sceneGraph.root.append(postprocess);

    gl.clearColor(0.3, 0.4, 1.0, FAR_AWAY);

    controller = new MouseController(input, camera);
}

loader.onready = function() {
    console.log('loaded');
    glUtils.getContext(canvas, true);
    prepareScene();
    glUtils.fullscreen(canvas, sceneGraph);
    clock.start();
}
loader.load([
    'shaders/transform.vertex',
    'shaders/heightmap.vertex',
    'shaders/color.frag',
    'shaders/sky.frag',
    'shaders/terrain.frag',
    'shaders/water.frag',
    'shaders/water.vertex',

    'shaders/screen.frag',
    'shaders/tonemapping.frag',
    'shaders/screen.vertex',

    'shaders/hemisphere.glsl',
    'shaders/transform.glsl',
    'shaders/sun.glsl',

    'gfx/heightmap.png',
    'gfx/normalnoise.png',
    'gfx/waternormal.jpg'
]);

clock.ontick = function(td) {
    time += 1.0;
    globalUniforms.time = time;
    sceneGraph.draw();
    controller.tick();
};

});
