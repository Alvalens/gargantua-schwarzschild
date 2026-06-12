import type { QualityTier } from './presets'
import { isCoarsePointer } from './pointer'

export interface DeviceSignals {
  coarsePointer: boolean
  cores: number
}

export function pickQuality(s: DeviceSignals): QualityTier {
  if (s.coarsePointer || s.cores < 4) return 'low'
  return 'high'
}

export function detectQuality(): QualityTier {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
  return pickQuality({ coarsePointer: isCoarsePointer(), cores })
}
