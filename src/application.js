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
        grid = new scene.SimpleMesh(vbo),
        shader = shaderManager.get('heightmap.vertex', 'terrain.frag'),
        transform = new scene.Transform([grid]),
        material = new scene.Material(shader, {
            color: new uniform.Vec3([1, 0, 0]),
            heightmap: heightmapTexture,
            skyColor: new uniform.Vec3([0.4, 0.4, 0.5]),
            groundColor: new uniform.Vec3([0.1, 0.1, 0.2]),
            sunColor: new uniform.Vec3([0.6, 0.6, 0.65]),
            sunDirection: new uniform.Vec3([0.577, 0.577, 0.577]),
        }, [transform]),
        camera = new scene.Camera([material]);

    mat4.translate(transform.matrix, [-0.5*GRID, -80, -0.5*GRID]);
    mat4.scale(transform.matrix, [GRID, 100, GRID]);
    sceneGraph.root.append(camera);

    controller = new MouseController(input, camera);
}


});
