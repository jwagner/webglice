precision highp float;

varying float depth;
varying vec3 worldPosition;
uniform vec3 horizonColor;
uniform vec3 zenithColor;
uniform vec3 sunColor;
uniform vec3 sunDirection;

void main(){
  vec3 direction = normalize(worldPosition);
  float a = max(0.0, dot(direction, vec3(0.0, 1.0, 0.0)));
  vec3 skyColor = mix(horizonColor, zenithColor, a);
  float sunTheta = max(dot(direction, sunDirection), 0.0);
  vec3 sun = max(sunTheta-0.999, 0.0)*sunColor*10000.0;
  vec3 sunAtmosphere = max(sunColor-zenithColor, vec3(0.0))*max(sunTheta-0.995, 0.0)*10.0;
  sunAtmosphere = sunAtmosphere*sunAtmosphere*50.0*vec3(2.0, 1.5, 0.4);
  gl_FragColor = vec4(skyColor+sun+sunAtmosphere, 100000.0);
}
