precision highp float;
varying vec2 vUv;

uniform vec2  uResolution;
uniform vec3  uCamPos;
uniform mat4  uCamToWorld;
uniform float uTanFov;
uniform float uTime;

uniform float uHorizon;
uniform float uEscape;
uniform float uSteps;
uniform float uStepSize;
uniform float uStarDensity;

vec3 rayDir(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 ndc = uv * 2.0 - 1.0;
  vec3 dirCam = normalize(vec3(ndc.x * aspect * uTanFov, ndc.y * uTanFov, -1.0));
  return normalize((uCamToWorld * vec4(dirCam, 0.0)).xyz);
}

// Cheap hash-based starfield sampled by direction.
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
vec3 starField(vec3 dir) {
  vec3 d = normalize(dir) * 60.0;
  float n = hash(floor(d));
  float star = smoothstep(1.0 - uStarDensity, 1.0, n);
  float tw = 0.7 + 0.3 * sin(uTime * 2.0 + n * 30.0);
  return vec3(star * tw) * vec3(0.9, 0.95, 1.0);
}

void main() {
  vec3 pos = uCamPos;
  vec3 dir = rayDir(vUv);

  // Conserved-ish angular momentum term for the deflection approximation.
  vec3 angMom = cross(pos, dir);
  float h2 = dot(angMom, angMom);

  vec3 color = vec3(0.0);
  bool captured = false;

  int steps = int(uSteps);
  for (int i = 0; i < 1024; i++) {
    if (i >= steps) break;

    float r = length(pos);
    if (r < uHorizon) { captured = true; break; }
    if (r > uEscape)  break;

    // Gravitational deflection of the light ray.
    vec3 accel = -1.5 * h2 * pos / pow(dot(pos, pos), 2.5);
    dir = normalize(dir + accel * uStepSize);
    pos += dir * uStepSize;
  }

  if (captured) {
    color = vec3(0.0);
  } else {
    color = starField(dir); // escaped or ran out of steps — sample lensed sky
  }

  gl_FragColor = vec4(color, 1.0);
}
