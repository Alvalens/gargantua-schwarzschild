import { useEffect } from 'react'
import { BlackHoleCanvas } from './scene/BlackHoleCanvas'
import { Section } from './sections/Section'
import { SECTIONS } from './sections/sectionsData'
import { ScrollProgress } from './ui/ScrollProgress'
import { HintCursor } from './ui/HintCursor'

// Tiny tiled SVG noise — breaks up banding in the shader's smooth gradients.
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function App() {
  // Sections mount after document load, so the browser's native anchor jump
  // misses them. Re-run it once the DOM exists (deep links + verification).
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    document.getElementById(hash)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])

  return (
    <main className="relative">
      <BlackHoleCanvas />
      {/* Cinematic overlay between canvas (z-0) and copy (z-10): a vignette to
          seat the disk's glare and lift side-column contrast, plus film grain
          to dither the shader's smooth gradients. */}
      <div aria-hidden className="fixed inset-0 z-[5] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.05]"
          style={{ backgroundImage: GRAIN_URI }}
        />
      </div>
      <ScrollProgress />
      <HintCursor />
      <div className="relative z-10 pointer-events-none">
        {SECTIONS.map((copy, i) => (
          <Section key={copy.id} copy={copy} index={i} total={SECTIONS.length} />
        ))}
      </div>
    </main>
  )
}
