precision highp float;

varying vec2 screenPosition;
const float blurSize = 1.0/512.0;
uniform sampler2D texture;

void main(){
  vec4 sum = vec4(0.0);

   sum += texture2D(texture, vec2(screenPosition.x - 4.0*blurSize, screenPosition.y)) * 0.05;
   sum += texture2D(texture, vec2(screenPosition.x - 3.0*blurSize, screenPosition.y)) * 0.09;
   sum += texture2D(texture, vec2(screenPosition.x - 2.0*blurSize, screenPosition.y)) * 0.12;
   sum += texture2D(texture, vec2(screenPosition.x - blurSize, screenPosition.y)) * 0.15;
   sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y)) * 0.16;
   sum += texture2D(texture, vec2(screenPosition.x + blurSize, screenPosition.y)) * 0.15;
   sum += texture2D(texture, vec2(screenPosition.x + 2.0*blurSize, screenPosition.y)) * 0.12;
   sum += texture2D(texture, vec2(screenPosition.x + 3.0*blurSize, screenPosition.y)) * 0.09;
   sum += texture2D(texture, vec2(screenPosition.x + 4.0*blurSize, screenPosition.y)) * 0.05;

   gl_FragColor = sum;
}
