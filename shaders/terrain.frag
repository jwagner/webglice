precision highp float;

varying vec3 vPosition;
varying vec3 surfaceNormal;
uniform vec3 color;

#include "hemisphere.glsl"

void main(){
  vec3 color = lightHemisphere(surfaceNormal);
  gl_FragColor = vec4(color, 1.0);
}
