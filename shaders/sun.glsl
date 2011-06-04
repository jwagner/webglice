uniform vec3 sunColor;
uniform vec3 sunDirection;

vec3 sunLight(const vec3 surfaceNormal){
  return max(dot(sunDirection, surfaceNormal),0.0)*sunColor;
}
