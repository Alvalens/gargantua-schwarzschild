# Black Hole — A Spacetime Portrait

A real-time raymarched Schwarzschild black hole, rendered photon by photon in a single GLSL fragment shader. Light bends around the event horizon under gravitational lensing, an accretion disk glows orange on its approaching side and dims to blue-white on the receding one through relativistic Doppler beaming, and a scroll-driven camera flight carries you from a wide establishing shot down toward the photon sphere — all wrapped in an editorial narrative about what you are seeing.

## Physics

The shader integrates photon paths through a Schwarzschild geodesic approximation: at each raymarch step the ray direction is deflected by `a = -1.5 h² r̂ / r⁴`, where `h` is the conserved angular momentum of the ray — this reproduces lensing, the photon ring, and capture at the horizon. The accretion disk orbits at Keplerian speed (`v ∝ r^-1/2`), and its emission is scaled by the `D³` relativistic beaming factor from the line-of-sight velocity, producing the characteristic bright/dim asymmetry. HDR output is tone-mapped with luminance-preserving Reinhard so the disk's hue survives its own brightness.

## Stack

- React 19 + TypeScript + Vite
- react-three-fiber (fullscreen shader quad) + custom GLSL raymarcher
- Zustand (scroll/camera/quality state)
- Framer Motion (narrative reveals)
- Tailwind CSS v4

## Running

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm test         # unit tests
```

## Controls

Drag to orbit · scroll to descend.

---

Built by **Alvalen Shafel**.
