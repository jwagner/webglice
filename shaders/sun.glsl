uniform vec3 sunColor;
uniform vec3 sunDirection;

vec3 sunLight(const vec3 surfaceNormal, const vec3 eyeNormal, float shiny, float spec, float diffuse){
  vec3 diffuseColor = max(dot(sunDirection, surfaceNormal),0.0)*sunColor*diffuse;
  vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));
  float direction = max(0.0, dot(eyeNormal, reflection));
  vec3 specular = pow(direction, shiny)*sunColor*spec;
  return diffuseColor + specular;
}
