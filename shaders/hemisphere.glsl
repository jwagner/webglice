uniform vec3 groundColor;
uniform vec3 skyColor;

vec3 lightHemisphere(vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(0, 1, 0));
  float a = costheta*0.5+0.5;
  return mix(groundColor, skyColor, a);
}
