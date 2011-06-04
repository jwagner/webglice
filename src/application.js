jQuery(function(){

provides('main');

var GRID = 512,
    scene = requires('scene'),
    mesh = requires('mesh'),
    Loader = requires('loader').Loader,
    ShaderManager = requires('shader').Manager,
    glUtils = requires('glUtils'),
    uniform = requires('uniform'),
    Clock = requires('clock').Clock,
    MouseController = requires('cameracontroller').MouseController,
    scene = requires('scene'),
    InputHandler = requires('input').Handler,
    canvas = document.getElementById('c'),
    clock = new Clock(),
    input = new InputHandler(canvas),
    loader = new Loader(),
    resources = loader.resources,
    shaderManager = new ShaderManager(resources),
    controller;


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
    'shaders/terrain.frag',
    'shaders/hemisphere.glsl',
    'shaders/sun.glsl',
    'gfx/heightmap.png'
]);

clock.ontick = function(td) {
    sceneGraph.draw();
    controller.tick();
};


var sceneGraph;

function prepareScene(){
    sceneGraph = new scene.Graph();

    var vbo = new glUtils.VBO(mesh.grid(GRID)),
        heightmapTexture = new glUtils.Texture2D(resources['gfx/heightmap.png']),
        mountainShader = shaderManager.get('heightmap.vertex', 'terrain.frag'),
        waterShader = shaderManager.get('transform.vertex', 'color.frag'),
        transform, waterTransform;
        
    var camera = new scene.Camera([
        new scene.Uniforms({
            skyColor: new uniform.Vec3([0.2, 0.3, 0.35]),
            groundColor: new uniform.Vec3([0.05, 0.1, 0.3]),
            sunColor: new uniform.Vec3([0.7, 0.6, 0.75]),
            sunDirection: new uniform.Vec3([0.577, 0.577, 0.577]),
        }, [
            new scene.Material(mountainShader, {
                heightmap: heightmapTexture
            }, [
                transform = new scene.Transform([
                    new scene.SimpleMesh(vbo),
                ])
            ]),
            new scene.Material(waterShader,{
                color: new uniform.Vec3([0, 0, 1])
            }, [
                waterTransform = new scene.Transform([
                    new scene.SimpleMesh(vbo)
                ])
            ])
        ]),
    ]);

    camera.position[1] = 30;

    mat4.translate(transform.matrix, [-0.5*GRID, -50, -0.5*GRID]);
    mat4.scale(transform.matrix, [GRID, 100, GRID]);


    mat4.translate(waterTransform.matrix, [-10*GRID, 0, -10*GRID]);
    mat4.scale(waterTransform.matrix, [GRID*20, 100, GRID*20]);

    sceneGraph.root.append(camera);

    gl.clearColor(0.4, 0.6, 1.0, 1.0);

    controller = new MouseController(input, camera);
}


});
