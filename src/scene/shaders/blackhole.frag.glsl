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

uniform float uDiskInner;
uniform float uDiskOuter;
uniform float uDiskBrightness;
uniform float uDopplerStrength;
uniform vec3  uColorInner;
uniform vec3  uColorOuter;

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
  vec3 d = normalize(dir) * 400.0;
  float n = hash(floor(d));
  float star = pow(smoothstep(1.0 - uStarDensity, 1.0, n), 3.0);
  float tw = 0.7 + 0.3 * sin(uTime * 2.0 + n * 30.0);
  return vec3(star * tw) * vec3(0.9, 0.95, 1.0);
}

// Emission color + Doppler/redshift for a disk hit at world position p, with the
// ray travelling in direction dir. Disk orbits prograde in the y=0 plane.
vec3 sampleDisk(vec3 p, vec3 dir) {
  float r = length(p.xz);
  float t = clamp((r - uDiskInner) / (uDiskOuter - uDiskInner), 0.0, 1.0);

  // Temperature ramp: hot/blue inside -> cool/orange outside.
  vec3 base = mix(uColorInner, uColorOuter, t);

  // Keplerian orbital velocity direction (tangent), magnitude ~ 1/sqrt(r).
  vec3 radial = normalize(vec3(p.x, 0.0, p.z));
  vec3 tangent = normalize(vec3(-radial.z, 0.0, radial.x));
  float speed = 0.7 / sqrt(max(r, 0.001)); // Keplerian: v = sqrt(M/r), M = Rs/2
  vec3 vel = tangent * speed;

  // Doppler factor: approaching (vel·-dir > 0) brightens + blueshifts.
  float beta = dot(vel, -normalize(dir));
  float dopp = 1.0 + uDopplerStrength * beta;
  float doppler = dopp * dopp * dopp;                   // beaming ~ D^3 brightness boost
  vec3 shift = vec3(1.0 - 0.7 * beta, 1.0, 1.0 + 0.7 * beta); // blueshift when approaching

  // Radial falloff so the inner edge glows hottest.
  float intensity = uDiskBrightness * doppler * (1.2 - 0.6 * t);
  // Soft edges.
  float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.92, t);

  return base * shift * intensity * edge;
}

void main() {
  vec3 pos = uCamPos;
  vec3 dir = rayDir(vUv);

  // Conserved-ish angular momentum term for the deflection approximation.
  vec3 angMom = cross(pos, dir);
  float h2 = dot(angMom, angMom);

  vec3 color = vec3(0.0);
  bool captured = false;
  float prevY = pos.y;

  int steps = int(uSteps);
  for (int i = 0; i < 1024; i++) {
    if (i >= steps) break;

    float r = length(pos);
    if (r < uHorizon) { captured = true; break; }
    if (r > uEscape)  break;

    // Gravitational deflection of the light ray.
    vec3 accel = -1.5 * h2 * pos / pow(dot(pos, pos), 2.5);
    vec3 newDir = normalize(dir + accel * uStepSize);
    vec3 newPos = pos + newDir * uStepSize;

    // Disk crossing: y changed sign between pos and newPos.
    if (prevY * newPos.y < 0.0) {
      float a = prevY / (prevY - newPos.y);          // interpolation factor
      vec3 hit = mix(pos, newPos, a);
      float rr = length(hit.xz);
      if (rr >= uDiskInner && rr <= uDiskOuter) {
        color += sampleDisk(hit, newDir);            // additive, glowing
      }
    }

    prevY = newPos.y;
    dir = newDir;
    pos = newPos;
  }

  if (!captured) color += starField(dir);
  // Simple tone-map so additive highlights don't blow out.
  color = color / (color + vec3(1.0));
  color = pow(color, vec3(0.85));
  gl_FragColor = vec4(color, 1.0);
}
