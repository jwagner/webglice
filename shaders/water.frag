precision highp float;

varying float depth;
varying vec4 projected;
varying vec3 worldPosition;
uniform vec3 color;
uniform sampler2D reflection;
uniform sampler2D normalnoise;
uniform vec3 eye;
uniform float time;

#include "sun.glsl"

void main(){
  vec2 uv = vec2(worldPosition.x, worldPosition.z);
  vec4 noise = (texture2D(normalnoise, (uv+time*0.03)*0.01) +
    texture2D(normalnoise, (uv+vec2(time*-0.05, time*-0.02))*0.02))*0.5;
  noise = noise-0.5;
  vec2 screenPosition = ((vec2(projected)/projected.w) + 1.0) * 0.5;
  vec3 reflection = vec3(texture2D(reflection,
screenPosition+vec2(noise.x*2.5, noise.y)*0.05));
  vec3 eyeNormal = normalize(worldPosition-eye);
  vec3 light = sunLight(normalize(vec3(0, 1, 0)+vec3(noise)*2.0), eyeNormal, 25.0, 3.0, 1.0);
  gl_FragColor = vec4(worldPosition+vec3(noise), 1.0);
  gl_FragColor = vec4((reflection+color)*light*color, depth);
}
