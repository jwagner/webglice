(function(){
var scene = provides('scene'),
    uniform = requires('uniform');

scene.Node = function SceneNode(children){
    this.children = children || [];
}
scene.Node.prototype = {
    children: [],
    visit: function(scene) {
        this.enter(scene);
        for(var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            child.visit(scene);
        }
        this.exit(scene);
    },
    append: function (child) {
        this.children.push(child);
    },
    enter: function(scene) {
    },
    exit: function(scene) {
    }
};

function uniformNode(names){
    function UniformNode(){
        this.uniforms = {};
        for(var i = 0; i < names.length; i++) {
            var name = names[i];
            this.uniforms[name] = arguments[i];
        }
        this.children = this.arguments[i] || [];
    }
    UniformNode.prototype = Object.create(uniformNodeProto);
}
var uniformNodeProto = extend({}, scene.Node.prototype, {
    enter: function(scene) {
        scene.pushUniforms();
        extend(scene.uniforms, this.uniforms);
    },
    exit: function(scene) {
        scene.popUniforms();
    }
});

scene.Graph = function SceneGraph(gl){
    this.root = new scene.Node();
    this.uniforms = {};
    this.shaders = [];
    this.viewportWidth = 640;
    this.viewportHeight = 480;
}
scene.Graph.prototype = {
    draw: function() {
        gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //gl.enable(gl.DEPTH_TEST);
        this.root.visit(this);
    },
    pushUniforms: function() {
        this.uniforms = Object.create(this.uniforms);
    },
    popUniforms: function() {
        this.uniforms = Object.getPrototypeOf(this.uniforms);
    },
    pushTexture: function () {
        return this.textureUnit++;
    },
    popTexture: function() {
        this.textureUnit--;
    },
    pushShader: function (shader) {
        this.shaders.push(shader);
    },
    popShader: function() {
        this.shaders.pop();
    },
    getShader: function () {
        return this.shaders[this.shaders.length-1];
    }
}

scene.Material = function Material(shader, uniforms, children) {
    this.shader = shader;
    this.uniforms = uniforms;
    this.children = children;
}
scene.Material.prototype = extend({}, scene.Node.prototype, {
    enter: function(scene){
        for(var uniform in this.uniforms){
            if(uniform.bindTexture){
                uniform.bindTexture(scene.pushTexture());
            }
        }
        scene.pushShader(this.shader);
        this.shader.use();
        this.shader.uniforms(scene.uniforms);
        this.shader.uniforms(this.uniforms);
    },
    exit: function(scene) {
        for(var uniform in this.uniforms){
            if(uniform.bindTexture){
                scene.popTexture();
            }
        }
        scene.popShader();
    }
});

scene.RenderTarget = function RenderTarget(fbo, children){
    this.fbo = fbo;
    this.children = children;
}
scene.RenderTarget.prototype = extend({}, scene.Node.prototype, {
    enter: function(scene) {
        this.fbo.bind();
        scene.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        scene.gl.viewport(0, 0, this.fbo.width, this.fbo.height);
    },
    exit: function(scene) {
        this.fbo.unbind();
        gl.viewport(0, 0, scene.viewportWidth, scene.viewportHeight);
    }
});

scene.Camera = function Camera(children){
    this.position = vec3.create([0, 0, 10]);
    this.pitch = 0.0;
    this.yaw = 0.0;
    this.near = 0.1;
    this.far = 5000;
    this.fov = 50;

    this.children = children;
}
scene.Camera.prototype = extend({}, scene.Node.prototype, {
    enter: function (scene) {
        scene.pushUniforms();
        scene.uniforms['projection'] = new uniform.Mat4(this.getProjection(scene));
        scene.uniforms['worldView'] = new uniform.Mat4(this.getWorldView());
        //this.project([0, 0, 0, 1], scene);
    },
    project: function(point, scene) {
        var mvp = mat4.create();
        mat4.multiply(this.getProjection(scene), this.getWorldView(), mvp);
        var projected = mat4.multiplyVec4(mvp, point, vec4.create());
        vec4.scale(projected, 1/projected[3]);
        return projected;
    },
    exit: function(scene) {
        scene.popUniforms();
    },
    getInverseRotation: function () {
        return mat3.toMat4(mat4.toInverseMat3(this.getWorldView()));
    },
    getProjection: function (scene) {
        return mat4.perspective(this.fov, scene.viewportWidth/scene.viewportHeight, this.near, this.far);
    },
    getWorldView: function(){
        var matrix = mat4.identity(mat4.create());
        mat4.rotateX(matrix, this.pitch);
        mat4.rotateY(matrix, this.yaw);
        mat4.translate(matrix, vec3.negate(this.position, vec3.create()));
        return matrix;
    }
});


scene.SimpleMesh = function SimpleMesh(vbo){
    this.vbo = vbo;
}
scene.SimpleMesh.prototype = {
    visit: function (scene) {
        var shader = scene.getShader(),
            location = shader.getAttribLocation('position'),
            stride = 0,
            offset = 0,
            normalized = false;
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 3, gl.FLOAT, normalized, stride, offset);

        this.vbo.bind();
        this.vbo.drawTriangles();
    }
};

var SunLight = uniformNode('sunLightDirection', 'sunColor'),
    Fog = uniformNode('fogViewDistance', 'fogColor');

})();
