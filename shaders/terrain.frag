precision highp float;

varying vec3 worldPosition;
varying vec3 surfaceNormal;
varying float depth;
uniform vec3 color;
uniform vec3 eye;

#include "hemisphere.glsl"
#include "sun.glsl"

void main(){
  vec3 color = lightHemisphere(surfaceNormal)+sunLight(surfaceNormal);
  gl_FragColor = vec4(color, depth);
}
