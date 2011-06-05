precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;

void main(){
  vec4 color = texture2D(texture, screenPosition);
  gl_FragColor = vec4(vec3(color), 1.0);
}
