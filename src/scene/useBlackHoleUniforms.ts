import { useMemo } from 'react'
import { Vector3, Matrix4 } from 'three'
import { PHYSICS, ART } from '../lib/presets'

type Physics = typeof PHYSICS
type Art = typeof ART

export interface StaticUniformValues {
  uHorizon: number
  uDiskInner: number
  uDiskOuter: number
  uEscape: number
  uSteps: number
  uStepSize: number
  uDiskBrightness: number
  uDopplerStrength: number
  uColorInner: readonly [number, number, number]
  uColorOuter: readonly [number, number, number]
  uStarDensity: number
}

export function buildStaticUniforms(physics: Physics, art: Art): StaticUniformValues {
  return {
    uHorizon: physics.horizonRadius,
    uDiskInner: physics.diskInner,
    uDiskOuter: physics.diskOuter,
    uEscape: physics.escapeRadius,
    uSteps: physics.marchSteps,
    uStepSize: physics.stepSize,
    uDiskBrightness: art.diskBrightness,
    uDopplerStrength: art.dopplerStrength,
    uColorInner: art.colorTempInner,
    uColorOuter: art.colorTempOuter,
    uStarDensity: art.starDensity,
  }
}

// Builds the three.js uniforms object once. Per-frame camera values are updated
// imperatively in BlackHole.tsx (see useFrame) to avoid re-allocations.
export function useInitialUniforms() {
  return useMemo(() => {
    const s = buildStaticUniforms(PHYSICS, ART)
    return {
      uTime: { value: 0 },
      uResolution: { value: [1, 1] as [number, number] },
      uCamPos: { value: new Vector3() },
      uCamToWorld: { value: new Matrix4() },
      uTanFov: { value: Math.tan((55 * Math.PI) / 180 / 2) },
      uHorizon: { value: s.uHorizon },
      uDiskInner: { value: s.uDiskInner },
      uDiskOuter: { value: s.uDiskOuter },
      uEscape: { value: s.uEscape },
      uSteps: { value: s.uSteps },
      uStepSize: { value: s.uStepSize },
      uDiskBrightness: { value: s.uDiskBrightness },
      uDopplerStrength: { value: s.uDopplerStrength },
      uColorInner: { value: s.uColorInner },
      uColorOuter: { value: s.uColorOuter },
      uStarDensity: { value: s.uStarDensity },
    }
  }, [])
}
