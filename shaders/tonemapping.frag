precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
uniform sampler2D bloom;
uniform float exposure;
uniform vec3 atmosphereColor;
uniform float atmosphereDistance;

void main(){
  vec4 bloomColor = texture2D(bloom, screenPosition)*0.5;
  // chromatic abbreviation
  vec4 color1 = texture2D(texture, screenPosition)+bloomColor;
  vec4 color2 = texture2D(texture, screenPosition-vec2(0.0, 0.002))+bloomColor;
  vec4 color = color1*vec4(1.0, 0.5, 0.5, 1.0)+color2*vec4(0.0, 0.5, 0.5, 1.0);
  //color = color1;
  // atmosphere/ambient
  //color += vec4(0.0, 0.05, 0.1, 1.0)*0.8;//*min(color.a*0.005, 1.0);
  color += vec4(0.0, 0.05, 0.1, 1.0)*(0.1*min(color.a*0.005, 10.0)+0.8);
  //color += vec4(0.0, 0.05, 0.1, 1.0)*min(color.a*0.01, 1.0);
  // tone mapping
  color = 1.0 - exp2(-color * exposure);
  // gamma correction
  gl_FragColor = vec4(pow(vec3(color), vec3(1.0/2.2)), 1.0);
  //gl_FragColor = vec4(color.rgb, 1.0);

}
