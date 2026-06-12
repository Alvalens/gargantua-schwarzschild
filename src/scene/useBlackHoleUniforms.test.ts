import { describe, it, expect } from 'vitest'
import { buildStaticUniforms } from './useBlackHoleUniforms'
import { PHYSICS, ART } from '../lib/presets'

describe('buildStaticUniforms', () => {
  it('maps physics + art presets into flat uniform values', () => {
    const u = buildStaticUniforms(PHYSICS, ART)
    expect(u.uHorizon).toBe(PHYSICS.horizonRadius)
    expect(u.uDiskInner).toBe(PHYSICS.diskInner)
    expect(u.uDiskOuter).toBe(PHYSICS.diskOuter)
    expect(u.uDopplerStrength).toBe(ART.dopplerStrength)
    expect(u.uColorInner).toEqual(ART.colorTempInner)
    expect(u.uColorOuter).toEqual(ART.colorTempOuter)
  })
})
