precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;

void main(){
  vec4 color = texture2D(texture, screenPosition);
  if(dot(vec3(color), vec3(1.0)) < 4.0)
    gl_FragColor = vec4(0.0);
  else
    gl_FragColor = vec4(vec3(color), 1.0);
}
