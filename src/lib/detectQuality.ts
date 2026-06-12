import type { QualityTier } from './presets'

export interface DeviceSignals {
  coarsePointer: boolean
  cores: number
}

export function pickQuality(s: DeviceSignals): QualityTier {
  if (s.coarsePointer || s.cores < 4) return 'low'
  return 'high'
}

export function detectQuality(): QualityTier {
  const coarsePointer =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches === true
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
  return pickQuality({ coarsePointer, cores })
}
