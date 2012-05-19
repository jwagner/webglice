precision highp float;

varying vec3 worldPosition;
varying vec3 surfaceNormal;
varying vec2 uv;
varying mat3 tbn;
varying float depth;
varying float occlusion;
uniform float clip;
uniform vec3 eye;
uniform sampler2D snowTexture;


#include "hemisphere.glsl"
#include "sun.glsl"

void main(){
  if(worldPosition.y > clip) {
    discard;
  }
  vec4 sample = texture2D(snowTexture, uv);
  vec3 normal = normalize(normalize(sample.rgb-0.5)*tbn+surfaceNormal);
  //normal = surfaceNormal;
  vec3 eyeNormal = normalize(eye - worldPosition);
  vec3 color = (lightHemisphere(normal))+sunLight(normal, eyeNormal, 15.0, 2.5 , 1.0);
  vec3 scatter = vec3(0.0, 0.03, 0.1)*(1.0-occlusion)*(1.0-occlusion);
  //color = normalize(normal*vec3(0.5)+vec3(0.5));
  //color = vec3(normal);
  //color = vec3(dot(vec3(0.0, 0.1, 1.0), normal));
  //color = vec3(occlusion);
  float depth = length(worldPosition-eye);
  gl_FragColor = vec4(color*occlusion*vec3(0.7, 0.9, 1.0)+scatter, depth);
  /*gl_FragColor = vec4(vec3(depth), depth);*/
}
