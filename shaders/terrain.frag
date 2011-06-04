precision highp float;

varying vec3 vPosition;
varying vec3 surfaceNormal;
uniform vec3 color;

#include "hemisphere.glsl"

void main(){
  gl_FragColor = vec4(surfaceNormal, 1.0);
}
