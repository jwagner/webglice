precision highp float;

varying float depth;
varying vec4 projected;
varying vec3 worldPosition;
uniform vec3 color;
uniform sampler2D reflection;
uniform sampler2D refraction;
uniform sampler2D normalnoise;
uniform vec3 eye;
uniform float time;

#include "sun.glsl"
#line 14

void main(){
  float depth = length(worldPosition-eye);

  vec2 uv = vec2(worldPosition.x, worldPosition.z);
  vec4 noise = (texture2D(normalnoise, (uv+vec2(time*0.43, time*0.39))*0.07)) + 
               (texture2D(normalnoise, (uv-vec2(time*0.41, -time*0.42))*0.05)) -1.0;
  vec2 screenPosition = ((vec2(projected)/projected.w) + 1.0) * 0.5;

  vec2 reflectionUV = clamp(screenPosition+vec2(noise.x, noise.y*0.5)*0.05, vec2(0.01), vec2(0.99));
  vec3 reflectionSample = vec3(texture2D(reflection, reflectionUV-vec2(noise)*0.05));

  vec4 refractionSample = texture2D(refraction, clamp(
    screenPosition-vec2(noise.x, noise.y*0.5)*0.01, vec2(0.01), vec2(0.99)));
  vec4 backgroundSample = texture2D(refraction, screenPosition);

  float waterDepth = min(refractionSample.a-depth, 40.0);
  /*vec3 extinction = min(exp2(-waterDepth*vec3(0.001)), 1.0);*/
  vec3 extinction = min((waterDepth/35.0)*vec3(2.0, 1.05, 1.0), vec3(1.0));
  vec3 refractionColor = mix(vec3(refractionSample)*0.5, color, extinction);

  vec3 eyeNormal = normalize(eye-worldPosition);
  vec3 surfaceNormal = normalize(vec3(0, 1, 0)+vec3(noise.x, 0, noise.y)*0.5);

  float theta1 = clamp(dot(eyeNormal, surfaceNormal), 0.0, 1.0);
  float rf0 = 0.02; // realtime rendering, page 236
  float reflectance = rf0 + (1.0 - rf0)*pow((1.0 - theta1), 5.0);

  /*float internalIOR = 1.333;
  float externalIOR = 1.0;
  float eta = externalIOR/internalIOR;
  float theta2 = sqrt(1.0 - (eta*eta) * (1.0 - (theta1 * theta1)));
  float rs = (externalIOR * theta1 - internalIOR * theta2) / (externalIOR*theta1 + internalIOR * theta2);
  float rp = (internalIOR * theta1 - externalIOR * theta2) / (internalIOR*theta1 + externalIOR * theta2);
  float reflectance = (rs*rs + rp*rp);*/

  /*vec3 light = sunLight(surfaceNormal, eyeNormal, 100.0, 15.0, 1.0);*/
  vec3 diffuseColor = max(dot(sunDirection, surfaceNormal),0.0)*sunColor*0.5;
  vec3 reflectionDirection = normalize(reflect(-sunDirection, surfaceNormal));
  float reflecttionDot = max(0.0, dot(eyeNormal, reflectionDirection));
  vec3 specularColor = pow(reflecttionDot, 128.0)*sunColor*50.0;
  vec3 finalColor = mix(refractionColor*diffuseColor, reflectionSample*(diffuseColor+specularColor), reflectance);

  //gl_FragColor = vec4(worldPosition+vec3(noise), 1.0);
  //gl_FragColor = vec4(finalColor, depth);
  gl_FragColor = vec4(finalColor, depth);
  /*gl_FragColor = vec4(refractionColor, depth);*/
  /*gl_FragColor = vec4(vec3(depth*0.01), depth);*/
  /*gl_FragColor = vec4(extinction, depth);*/
  /*gl_FragColor = vec4(vec3(reflectance), depth);*/
  /*gl_FragColor = vec4(vec3(refractionSample.a*0.01, depth*0.01, waterDepth/50.0), depth);*/
  /*gl_FragColor = vec4(vec3(refractionSample.a), depth);*/

}
