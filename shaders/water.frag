precision highp float;

varying float depth;
varying vec4 projected;
varying vec3 worldPosition;
uniform vec3 color;
uniform sampler2D reflection;
uniform vec3 eye;

#include "sun.glsl"

void main(){
  vec2 screenPosition = ((vec2(projected)/projected.w) + 1.0) * 0.5;
  vec3 reflection = vec3(texture2D(reflection, screenPosition));
  vec3 light = sunLight(vec3(0, 1, 0), normalize(worldPosition-eye), 55.0, 5.0, 1.0);
  gl_FragColor = vec4((reflection+color)*light, depth);
}
