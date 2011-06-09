uniform vec3 groundColor;
uniform vec3 skyColor;

vec3 lightHemisphere(const vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(0.0, 1.0, 0.0));
  float a = max(costheta, 0.0);
  return mix(groundColor, skyColor, a);
}
