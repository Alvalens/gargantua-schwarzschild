// All distances in gravitational radii. Black hole at origin, disk in XZ plane.
export const PHYSICS = {
  horizonRadius: 1.0,        // Rs (event horizon)
  diskInner: 2.2,            // inner edge of accretion disk
  diskOuter: 7.0,            // outer edge
  escapeRadius: 40.0,        // beyond this a ray is treated as reaching the sky
  marchSteps: 240,           // initial uniform seed; per-frame value comes from QUALITY tier
  stepSize: 0.18,            // base integration step length
} as const

export const ART = {
  diskBrightness: 1.1,
  dopplerStrength: 1.0,      // 0 = none, 1 = extreme blue/red asymmetry
  colorTempInner: [0.6, 0.78, 1.0] as [number, number, number], // hot/blue
  colorTempOuter: [1.0, 0.45, 0.12] as [number, number, number], // cool/orange
  starDensity: 0.035,
  bloom: 0.6,
} as const

// Quality tiers — chosen at runtime by device capability.
export const QUALITY = {
  high: { resolutionScale: 0.85, marchSteps: 240 },
  low: { resolutionScale: 0.55, marchSteps: 120 },
} as const

export type QualityTier = keyof typeof QUALITY
