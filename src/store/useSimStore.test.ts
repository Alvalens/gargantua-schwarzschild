import { describe, it, expect, beforeEach } from 'vitest'
import { useSimStore } from './useSimStore'

describe('useSimStore', () => {
  beforeEach(() => useSimStore.getState().reset())

  it('starts at scroll 0, section 0, high quality', () => {
    const s = useSimStore.getState()
    expect(s.scrollProgress).toBe(0)
    expect(s.activeSection).toBe(0)
    expect(s.quality).toBe('high')
  })

  it('setScrollProgress clamps to [0,1]', () => {
    useSimStore.getState().setScrollProgress(1.5)
    expect(useSimStore.getState().scrollProgress).toBe(1)
    useSimStore.getState().setScrollProgress(-0.2)
    expect(useSimStore.getState().scrollProgress).toBe(0)
  })

  it('setActiveSection updates the index', () => {
    useSimStore.getState().setActiveSection(3)
    expect(useSimStore.getState().activeSection).toBe(3)
  })

  it('setQuality switches tier', () => {
    useSimStore.getState().setQuality('low')
    expect(useSimStore.getState().quality).toBe('low')
  })
})
