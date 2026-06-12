import { create } from 'zustand'
import type { QualityTier } from '../lib/presets'
import { detectQuality } from '../lib/detectQuality'

const initialQuality = typeof window !== 'undefined' ? detectQuality() : 'high'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

interface SimState {
  scrollProgress: number       // 0..1 across the whole page
  activeSection: number        // index of the section in view
  quality: QualityTier
  setScrollProgress: (n: number) => void
  setActiveSection: (i: number) => void
  setQuality: (q: QualityTier) => void
  reset: () => void
}

export const useSimStore = create<SimState>((set) => ({
  scrollProgress: 0,
  activeSection: 0,
  quality: initialQuality,
  setScrollProgress: (n) => set({ scrollProgress: clamp01(n) }),
  setActiveSection: (i) => set({ activeSection: i }),
  setQuality: (q) => set({ quality: q }),
  reset: () => set({ scrollProgress: 0, activeSection: 0, quality: initialQuality }),
}))
