export type Vec3 = [number, number, number]

export interface CameraKeyframe {
  at: number        // scrollProgress where this keyframe is centered (0..1)
  position: Vec3    // camera position in gravitational radii
  fov: number
}

// One keyframe per narrative section (Hero→Outro). Tuned for the scene.
export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0,  position: [0, 2.5, 16], fov: 55 },   // Hero: wide establishing
  { at: 0.25, position: [0, 0.6, 11], fov: 55 },   // Lensing: dip to see halo
  { at: 0.5,  position: [3, 0.2, 7],  fov: 60 },   // Disk: push toward plane
  { at: 0.75, position: [9, 0.1, 0.5],fov: 60 },   // Doppler: side-on
  { at: 1.0,  position: [0, 4, 20],   fov: 50 },   // Outro: pull back
]

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t),
]

export function cameraPresetAt(progress: number): { position: Vec3; fov: number } {
  const p = clamp01(progress)
  const k = CAMERA_KEYFRAMES
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i]
    const b = k[i + 1]
    if (p >= a.at && p <= b.at) {
      const span = b.at - a.at || 1
      const t = (p - a.at) / span
      return { position: lerp3(a.position, b.position, t), fov: lerp(a.fov, b.fov, t) }
    }
  }
  const last = k[k.length - 1]
  return { position: last.position, fov: last.fov }
}
