var targetExposure = 3.5,
    rotation = false;
jQuery(function(){

provides('main');

var sceneGraph;

function getHashValue(name, default_){
    var match = window.location.hash.match('[#,]+' + name + '(=([^,]*))?');
    if(!match){
        return default_;
    }
    return match.length == 3 && match[2] != null ? match[2] : true;
}

var Q = getHashValue('q', 0.5)*1,
    DEBUG = getHashValue('debug', false),
    GRID_RESOLUTION = 512*Q,
    GRID_SIZE = 512,
    FAR_AWAY = 100000,
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

console.log('Q=' + Q);
console.log('DEBUG=' + DEBUG);

function prepareScene(){
    sceneGraph = new scene.Graph();

    var vbo = new glUtils.VBO(mesh.grid(GRID_RESOLUTION)),
        waterVBO = new glUtils.VBO(mesh.grid(100)),
        heightmapTexture = new glUtils.Texture2D(resources['gfx/heightmap.png']),
        occlusionTexture = new glUtils.Texture2D(resources['gfx/occlusion.png']),
        normalnoiseTexture = new glUtils.Texture2D(resources['gfx/normalnoise.png']),
        snowTexture = new glUtils.Texture2D(resources['gfx/snow.png']),
        mountainShader = shaderManager.get('heightmap.vertex', 'terrain.frag'),
        waterShader = shaderManager.get('water'),
        postShader = shaderManager.get('screen.vertex', 'tonemapping.frag'),
        brightpassShader = shaderManager.get('screen.vertex', 'brightpass.frag'),
        vblurShader = shaderManager.get('screen.vertex', 'vblur.frag'),
        hblurShader = shaderManager.get('screen.vertex', 'hblur.frag'),
        skyShader = shaderManager.get('transform.vertex', 'sky.frag'),
        mountainTransform, waterTransform, flipTransform;
    globalUniforms = {
        skyColor: new uniform.Vec3([0.1, 0.15, 0.45]),
        // looks sexy for some reason
        groundColor: new uniform.Vec3([0.025, 0.05, 0.1]),
        sunColor: new uniform.Vec3([1.6, 1.47, 1.29]),
        sunDirection: new uniform.Vec3([0.0, 0.5, 1.0]),
        time: time,
        clip: 1000
    };

    vec3.normalize(globalUniforms.sunDirection.value);


    var mountain = new scene.Material(mountainShader, {
                heightmap: heightmapTexture,
                occlusionmap: occlusionTexture,
                snowTexture: snowTexture
            }, [
            mountainTransform = new scene.Transform([
                new scene.SimpleMesh(vbo)
            ])
        ]),
        sky = new scene.Transform([
            new scene.Skybox(skyShader, {
                horizonColor: new uniform.Vec3([0.25, 0.5, 1.2]),
                zenithColor: new uniform.Vec3([0.025, 0.1, 0.5])
            })
        ]);

    var mountainDepthFBO = new glUtils.FBO(1024*Q, 512*Q, gl.FLOAT),
        mountainDepthTarget = new scene.RenderTarget(mountainDepthFBO, [
            new scene.Uniforms({clip: 2.0}, [
                /* sky is needed because clearing on windows does not work
                * properly, can be optimized by using a simpler shader */
                mountain, sky
            ])
        ]),
        reflectionFBO = new glUtils.FBO(1024*Q, 512*Q, gl.FLOAT),
        reflectionTarget = new scene.RenderTarget(reflectionFBO, [
            new scene.Uniforms({clip: 0.3}, [
                flipTransform = new scene.Mirror([mountain, sky])
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
            ]),
        combinedFBO = new glUtils.FBO(2048*Q, 1024*Q, gl.FLOAT),
        combinedTarget = new scene.RenderTarget(combinedFBO, [water, mountain,  sky]),
        bloomFBO0 = new glUtils.FBO(1024*Q, 512*Q, gl.FLOAT),
        bloomFBO1 = new glUtils.FBO(512, 256, gl.FLOAT),
        brightpass = new scene.RenderTarget(bloomFBO0, [
            new scene.Postprocess(brightpassShader, {
                texture: combinedFBO
            })
        ]),
        hblurpass = new scene.RenderTarget(bloomFBO1, [
            new scene.Postprocess(hblurShader, {
                texture: bloomFBO0
            })
        ]),
        vblurpass = new scene.RenderTarget(bloomFBO0, [
            new scene.Postprocess(vblurShader, {
                texture: bloomFBO1
            })
        ]),
        bloom = new scene.Node([
            brightpass,
            hblurpass,
            vblurpass
        ]);


    var camera = new scene.Camera([
            new scene.Uniforms(globalUniforms, [
                mountainDepthTarget,
                reflectionTarget,
                combinedTarget
            ])
        ]),
        postprocess = new scene.Postprocess(postShader, {
            texture: combinedFBO,
            bloom: bloomFBO0,
            exposure: 0.0
        });

 //   mountainTransform.debug = true;

    camera.position[0] = -100;
    camera.position[1] = 30;
    camera.position[2] = -400;
    camera.yaw = Math.PI-0.2;
    camera.pitch = -0.15;

    mat4.translate(mountainTransform.matrix, [-0.5*GRID_SIZE, -50, -0.5*GRID_SIZE]);
    mat4.scale(mountainTransform.matrix, [GRID_SIZE, 100, GRID_SIZE]);

    mat4.scale(flipTransform.matrix, [1, -1, 1]);

    mat4.translate(waterTransform.matrix, [-FAR_AWAY*0.5, 0, -FAR_AWAY*0.5]);
    mat4.scale(waterTransform.matrix, [FAR_AWAY, 1, FAR_AWAY]);

    mat4.translate(sky.matrix, [0, -200, 0]);
    mat4.scale(sky.matrix, [FAR_AWAY, FAR_AWAY, FAR_AWAY]);

    camera.far = FAR_AWAY*2;
    camera.near = 1.0;

    sceneGraph.root.append(camera);
    sceneGraph.root.append(bloom);
    sceneGraph.root.append(postprocess);

    gl.clearColor(1.0, 1.0, 1.0, FAR_AWAY);

    controller = new MouseController(input, camera);

    clock.ontick = function(td) {
        time += td;
        globalUniforms.time = time;
        if(rotation){
            camera.yaw -= 0.05*td;
            camera.pitch = 0.2;
            var a = camera.yaw + Math.PI*0.5,
                distance = 250;
            camera.position[0] = Math.cos(a)*distance;
            camera.position[1] = 50;
            camera.position[2] = Math.sin(a)*distance;
        }

        var exposure = postprocess.children[0].uniforms.exposure,
            delta = targetExposure-exposure;

        if(delta > 0) {
            postprocess.children[0].uniforms.exposure += Math.min(0.5*td*(exposure+0.1), delta);
        }
        else if (delta < 0) {
            postprocess.children[0].uniforms.exposure += Math.max(-0.5*td*(exposure+0.1), delta);
        }

        sceneGraph.draw();
        controller.tick(td);
    };

    input.onKeyUp = function(key) {
        console.log(key);
        if(key == '1'){
            rotation = !rotation;
        }
        if(key == '2'){
            //postprocess.children[0].uniforms.exposure = 0.25;
            targetExposure = 0.1;
        }
        if(key == '3'){
            //postprocess.children[0].uniforms.exposure = 3.5;
            targetExposure = 3.5;
        }
        if(key == '0'){
            targetExposure = 0.0;
        }

    };
}

loader.onready = function() {
    console.log('loaded');
    glUtils.getContext(canvas, DEBUG);
    if(window.gl){
        gl.getExtension('OES_texture_float_linear');
        prepareScene();
        glUtils.fullscreen(canvas, sceneGraph);
        clock.start();
    }
};

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
    'shaders/hblur.frag',
    'shaders/vblur.frag',
    'shaders/brightpass.frag',
    'shaders/screen.vertex',

    'shaders/hemisphere.glsl',
    'shaders/transform.glsl',
    'shaders/sun.glsl',

    'gfx/heightmap.png',
    'gfx/occlusion.png',
    'gfx/normalnoise.png',
    'gfx/snow.png'
]);


});
