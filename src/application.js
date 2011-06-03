jQuery(function(){

provides('main');

var scene = requires('scene'),
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
    'shaders/color.frag'
]);

clock.ontick = function(td) {
    sceneGraph.draw();
    controller.tick();
};


var sceneGraph;

function prepareScene(){
    sceneGraph = new scene.Graph();

    var vbo = new glUtils.VBO(new Float32Array([
            -1, 1, 1,
            0, -1, 1,
            1, 1, 1
        ])),
        mesh = new scene.SimpleMesh(vbo),
        shader = shaderManager.get('transform.vertex', 'color.frag'),
        transform = new scene.Transform([mesh]),
        material = new scene.Material(shader, {
            color: new uniform.Vec3([1, 0, 0])
        }, [transform]),
        camera = new scene.Camera([material]);

    mat4.translate(transform.matrix, [1, 0, 0]);
    sceneGraph.root.append(camera);

    controller = new MouseController(input, camera);
}


});
