precision highp float;

varying float depth;
varying vec4 projected;
varying vec3 worldPosition;
uniform vec3 color;
uniform sampler2D reflection;
uniform sampler2D normalnoise;
uniform vec3 eye;

#include "sun.glsl"

void main(){
  vec4 noise = texture2D(normalnoise, vec2(worldPosition.x,worldPosition.z)*0.01);
  noise = noise-0.5;
  vec2 screenPosition = ((vec2(projected)/projected.w) + 1.0) * 0.5;
  vec3 reflection = vec3(texture2D(reflection,
screenPosition+vec2(noise)*0.05));
  vec3 eyeNormal = normalize(worldPosition-eye);
  vec3 light = sunLight(normalize(vec3(0, 1, 0)+vec3(noise)*2.0), eyeNormal, 25.0, 3.0, 1.0);
  gl_FragColor = vec4(worldPosition+vec3(noise), 1.0);
  gl_FragColor = vec4((reflection+color)*light, depth);
}
