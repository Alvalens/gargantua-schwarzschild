precision highp float;
varying vec2 vUv;

uniform vec2  uResolution;
uniform vec3  uCamPos;
uniform mat4  uCamToWorld;
uniform float uTanFov;

// Build a world-space ray direction for this fragment.
vec3 rayDir(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 ndc = uv * 2.0 - 1.0;          // -1..1
  vec3 dirCam = normalize(vec3(ndc.x * aspect * uTanFov, ndc.y * uTanFov, -1.0));
  return normalize((uCamToWorld * vec4(dirCam, 0.0)).xyz);
}

void main() {
  vec3 dir = rayDir(vUv);
  gl_FragColor = vec4(dir * 0.5 + 0.5, 1.0); // visualize direction as color
}
