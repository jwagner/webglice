(function(){

var shader = provides('shader');

function makeShader(shaderType, source){
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.log(gl.getShaderInfoLog(shader), shaderType, source);
        throw 'Compiler exception: "' + gl.getShaderInfoLog(shader) + '"';
    }
    return shader;
}

function makeProgram(vertexSource, fragmentSource){
    var vertexShader = makeShader(gl.VERTEX_SHADER, vertexSource),
        fragmentShader = makeShader(gl.FRAGMENT_SHADER, fragmentSource),
        program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        throw 'Linker exception: ' + gl.getProgramInfoLog(program);
    }

    return program;
}

function Shader(vertexSource, fragmentSource) {
        this.program = makeProgram(vertexSource, fragmentSource);
        this.uniformInfo = {};
}
Shader.prototype = {
    use: function() {
        gl.useProgram(this.program);
    },
    uniforms: function (values) {
        for(var name in values){
            var location = gl.getUniformLocation(this.program, name),
                value = values[name];
            if(typeof value == 'number'){
                gl.uniform1f(location, value);
            }
            else {
                value.uniform(location);
            }
        }
    },
    getAttribLocation: function(name) {
        var location = gl.getAttribLocation(this.program, name);
        if(location < 0){
            throw 'undefined attribute ' + name;
        }
        return location;
    }
};

shader.Manager = function ShaderManager(resources){
    this.resources = resources;
    this.shaders = [];
}
shader.Manager.prototype = {
    prefix: 'shaders/',
    includeExpression: /#include "([^"]+)"/g,
    preprocess: function(content) {
        return content.replace(this.includeExpression, function (_, name) {
            return this.getSource(name);
        }.bind(this));
    },
    getSource: function(name) {
        return this.preprocess(this.resources[this.prefix + name]);
    },
    get: function(vertex, frag) {
        if(!frag) {
            frag = vertex + '.frag';
            vertex = vertex + '.vertex';
        }
        var key = frag + ';' + vertex;
        if(!(key in this.shaders)){
            this.shaders[key] = new Shader(this.getSource(vertex), this.getSource(frag));
        }
        return this.shaders[key];
    }
}

})();
