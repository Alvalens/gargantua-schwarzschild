import { useScroll, useMotionValueEvent, motion } from 'framer-motion'
import { useSimStore } from '../store/useSimStore'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const setScrollProgress = useSimStore((s) => s.setScrollProgress)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setScrollProgress(v)
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-px z-20 origin-left pointer-events-none"
      style={{ scaleX: scrollYProgress, background: 'var(--paper)', opacity: 0.7 }}
    />
  )
}
