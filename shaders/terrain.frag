precision highp float;

varying vec3 worldPosition;
varying vec3 surfaceNormal;
varying float depth;
uniform float clip;
uniform vec3 color;
uniform vec3 eye;

#include "hemisphere.glsl"
#include "sun.glsl"

void main(){
  if(worldPosition.y > clip) {
    discard;
  }
  vec3 eyeNormal = normalize(worldPosition - eye);
  vec3 color = lightHemisphere(surfaceNormal)+sunLight(surfaceNormal, eyeNormal, 5.0, 0.5, 1.0);
  gl_FragColor = vec4(color*vec3(0.7, 0.8, 1.0), depth);
}
