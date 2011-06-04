(function(){

var glUtils = provides('glUtils');

glUtils.Texture2D = function Texture2D(image) {
    this.texture = gl.createTexture();
    this.bindTexture();
    this.unit = -1;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
}
glUtils.Texture2D.prototype = {
    bindTexture: function(unit) {
        if(unit !== undefined){
            gl.activeTexture(gl.TEXTURE0+unit);
            this.unit = unit;
        }
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    },
    uniform: function (location) {
        gl.uniform1i(location, this.unit);
    }
}

glUtils.VBO = function VBO(data){
    this.buffer = gl.createBuffer();
    this.bind();
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.length = data.length;
}
glUtils.VBO.prototype = {
    bind: function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    },
    drawTriangles: function() {
        gl.drawArrays(gl.TRIANGLES, 0, this.length/3);
    }
};

glUtils.getContext = function (canvas, debug) {
    window.gl = canvas.getContext('experimental-webgl');

    if(window.WebGLDebugUtils && debug){
        window.gl = WebGLDebugUtils.makeDebugContext(gl);
        console.log('running in debug context');
    }

    gl.lost = false;
    canvas.addEventListener('webglcontextlost', function () {
        console.log('lost webgl context!');
    }, false);
    canvas.addEventListener('webglcontextrestored', function () {
        console.log('restored webgl context!');
    }, false);

    return window.gl;
};

glUtils.fullscreen = function (canvas, scene) {
    function onresize() {
        canvas.width = scene.viewportWidth = window.innerWidth;
        canvas.height = scene.viewportHeight = window.innerHeight;
        scene.draw();
    }
    window.addEventListener('resize', onresize, false);
    onresize();
};

})();
