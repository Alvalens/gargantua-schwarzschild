import { useEffect } from 'react'
import { BlackHoleCanvas } from './scene/BlackHoleCanvas'
import { Section } from './sections/Section'
import { SECTIONS } from './sections/sectionsData'
import { ScrollProgress } from './ui/ScrollProgress'
import { HintCursor } from './ui/HintCursor'

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
