precision highp float;

varying float depth;
varying vec4 projected;
uniform vec3 color;
uniform sampler2D reflection;

void main(){
  vec2 screenPosition = ((vec2(projected)/projected.w) + 1.0) * 0.5;
  vec3 reflection = vec3(texture2D(reflection, screenPosition));
  gl_FragColor = vec4(reflection+color, depth);
}
