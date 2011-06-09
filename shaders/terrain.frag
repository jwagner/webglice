precision highp float;

varying vec3 worldPosition;
varying vec3 surfaceNormal;
varying vec2 uv;
varying mat3 tbn;
varying float depth;
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
  vec3 color = (lightHemisphere(normal))+sunLight(normal, eyeNormal, 115.0, 5.0 , 1.0);
  //color = normalize(normal*vec3(0.5)+vec3(0.5));
  //color = vec3(normal);
  //color = vec3(dot(vec3(0.0, 0.1, 1.0), normal));
  gl_FragColor = vec4(color, depth);//*vec3(0.5, 0.8, 1.0), depth);
}
