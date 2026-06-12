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

// --- Turbulent gas noise -----------------------------------------------------
// 3D value noise built on the same cheap hash as the starfield.
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash(i);
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));
  return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
             mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
}

// 3-octave fbm, normalized to ~[0,1]. Only evaluated at disk hits, never per step.
float fbm(vec3 p) {
  float v = 0.5000 * vnoise(p);
  p = p * 2.17 + vec3(11.3);
  v += 0.2500 * vnoise(p);
  p = p * 2.17 + vec3(5.7);
  v += 0.1250 * vnoise(p);
  return v * (1.0 / 0.875);
}

// Seamless flow-aligned disk turbulence in polar coords. The azimuthal angle is
// embedded on a circle (cos/sin) so noise wraps with no seam at theta = +/-pi.
// Radial frequency >> azimuthal frequency => streaks elongated along the orbit.
float diskNoise(float r, float theta, float dt, float seed) {
  float a = theta - 0.7 * pow(r, -1.5) * dt; // differential Keplerian rotation
  vec3 p = vec3(cos(a) * 2.8, sin(a) * 2.8, r * 4.5) + seed;
  return fbm(p);
}

// Differential rotation winds the pattern into ever-tighter spirals; crossfade
// two half-period-offset samples so shear stays bounded (no aliasing over time).
float flowNoise(float r, float theta, float seed) {
  const float T = 36.0; // rewind period (seconds)
  float t1 = mod(uTime, T);
  float t2 = mod(uTime + 0.5 * T, T);
  float w = abs(t1 / T * 2.0 - 1.0); // 1 when t1 wraps, 0 mid-life
  float n1 = diskNoise(r, theta, t1, seed);
  float n2 = diskNoise(r, theta, t2, seed + 47.0);
  return mix(n1, n2, w);
}

// Emission color + Doppler/redshift for a disk hit at world position p, with the
// ray travelling in direction dir. Disk orbits prograde in the y=0 plane.
vec3 sampleDisk(vec3 p, vec3 dir) {
  float r = length(p.xz);
  float t = clamp((r - uDiskInner) / (uDiskOuter - uDiskInner), 0.0, 1.0);
  float theta = atan(p.z, p.x);

  // Turbulent filaments: fine streaks sheared by differential rotation, plus a
  // slower large-scale brightness patch layer. The coarse layer also warps the
  // fine layer's radius so strands wobble instead of tracing perfect circles.
  float coarse = vnoise(vec3(cos(theta) * 0.9, sin(theta) * 0.9,
                             r * 1.3 - 0.12 * uTime) + 31.0);
  float fine = flowNoise(r + (coarse - 0.5) * 0.55, theta, 0.0);
  float filaments = mix(0.32, 1.7, pow(fine, 1.75));
  filaments *= mix(0.75, 1.3, coarse);

  // Temperature ramp: hot/blue inside -> cool/orange outside.
  vec3 base = mix(uColorInner, uColorOuter, t);
  // Inner-edge heat: pull toward white-hot before the Doppler tint at small t.
  base = mix(vec3(1.0, 0.97, 0.92), base, smoothstep(0.0, 0.22, t));

  // Keplerian orbital velocity direction (tangent), magnitude ~ 1/sqrt(r).
  vec3 radial = normalize(vec3(p.x, 0.0, p.z));
  vec3 tangent = normalize(vec3(-radial.z, 0.0, radial.x));
  float speed = 0.7 / sqrt(max(r, 0.001)); // Keplerian: v = sqrt(M/r), M = Rs/2
  vec3 vel = tangent * speed;

  // Doppler factor: approaching (vel·-dir > 0) brightens + blueshifts.
  float beta = dot(vel, -normalize(dir));
  float dopp = max(1.0 + uDopplerStrength * beta, 0.0); // guard: non-negative under extreme tuning
  float doppler = dopp * dopp * dopp;                   // beaming ~ D^3 brightness boost
  vec3 shift = vec3(1.0 - 0.7 * beta, 1.0, 1.0 + 0.7 * beta); // blueshift when approaching

  // Radial falloff so the inner edge glows hottest, plus a searing photon-ring
  // intensity bump hugging the inner radius.
  float heat = 1.0 + 1.7 * exp(-(r - uDiskInner) * 3.6);
  float intensity = uDiskBrightness * doppler * (1.2 - 0.6 * t) * heat * filaments;
  // Soft edges.
  float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.92, t);

  // Hue shift applied after intensity: pull approaching side toward saturated
  // blue and receding side toward deep orange-red so the split survives the
  // tone-map instead of washing out to cream.
  vec3 doppTint = beta > 0.0 ? vec3(0.4, 0.65, 1.0) : vec3(1.0, 0.35, 0.1);
  float tintAmt = clamp(abs(beta) * 2.6 * uDopplerStrength, 0.0, 0.75);
  vec3 col = mix(base * shift, doppTint, tintAmt);

  return col * intensity * edge;
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

    // Disk atmosphere: faint hot-gas haze above/below the plane. One exp per
    // step inside the radial band only; gives the disk vertical thickness and
    // an edge-on glow without turning the scene foggy.
    if (abs(newPos.y) < 1.2) {
      float ra = length(newPos.xz);
      if (ra > uDiskInner - 0.3 && ra < uDiskOuter) {
        float hy = newPos.y * 3.6;                   // h ~ 0.28
        float g = exp(-hy * hy);
        float ta = clamp((ra - uDiskInner) / (uDiskOuter - uDiskInner), 0.0, 1.0);
        vec3 gcol = mix(uColorInner, uColorOuter, ta);
        // Cheap Doppler brightness/tint for the haze (no pow, reuse beta).
        float betaA = 0.7 * inversesqrt(ra) *
                      dot(vec3(-newPos.z, 0.0, newPos.x) / ra, -newDir) * uDopplerStrength;
        gcol *= 1.0 + 1.6 * betaA;
        gcol.b *= 1.0 + 0.5 * betaA;                 // approaching side runs bluer
        float band = smoothstep(uDiskInner - 0.3, uDiskInner + 0.2, ra) *
                     smoothstep(uDiskOuter, uDiskOuter - 1.5, ra);
        float hot = 1.0 + 1.8 * exp(-(ra - uDiskInner) * 1.4);
        color += gcol * g * band * hot * 0.034 * uStepSize * uDiskBrightness;
      }
    }

    prevY = newPos.y;
    dir = newDir;
    pos = newPos;
  }

  if (!captured) color += starField(dir);
  // Luminance-based Reinhard: compresses brightness but preserves hue ratios,
  // so the Doppler split doesn't desaturate toward white. l -> 0 keeps the
  // scale factor ~1, so true blacks stay black.
  float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color *= (l / (1.0 + l)) / max(l, 1e-4);
  // Gentle saturation boost post tone-map.
  vec3 gray = vec3(dot(color, vec3(0.2126, 0.7152, 0.0722)));
  color = clamp(mix(gray, color, 1.35), 0.0, 1.0);
  color = pow(color, vec3(0.85));
  gl_FragColor = vec4(color, 1.0);
}
