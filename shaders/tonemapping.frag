precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
uniform sampler2D bloom;
uniform vec3 atmosphereColor;
uniform float atmosphereDistance;

void main(){
  vec4 bloomColor = texture2D(bloom, screenPosition)*0.5;
  vec4 color = texture2D(texture, screenPosition)+bloomColor;
  // atmosphere
  color += vec4(0.0, 0.2, 0.3, 1.0)*min(color.a*0.001, 1.0);
  vec3 x = max(vec3(0, 0, 0), vec3(color)-0.004);
  vec3 gammaCorrected = (x*(6.2*x+0.5))/(x*(6.2*x+1.7)+0.06);
  gl_FragColor = vec4(gammaCorrected, 1.0);//
  //gl_FragColor = vec4(pow(vec3(color), vec3(1.0/2.2)), 1.0);

}
