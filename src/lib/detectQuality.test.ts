import { describe, it, expect } from 'vitest'
import { pickQuality } from './detectQuality'

describe('pickQuality', () => {
  it('returns low for coarse pointer / few cores', () => {
    expect(pickQuality({ coarsePointer: true, cores: 4 })).toBe('low')
    expect(pickQuality({ coarsePointer: false, cores: 2 })).toBe('low')
  })
  it('returns high for fine pointer with many cores', () => {
    expect(pickQuality({ coarsePointer: false, cores: 8 })).toBe('high')
  })
  it('returns high at the 4-core boundary with a fine pointer', () => {
    expect(pickQuality({ coarsePointer: false, cores: 4 })).toBe('high')
  })
})
