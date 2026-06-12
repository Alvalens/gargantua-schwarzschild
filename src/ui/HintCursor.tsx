import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSimStore } from '../store/useSimStore'
import { isCoarsePointer } from '../lib/pointer'

export function HintCursor() {
  const activeSection = useSimStore((s) => s.activeSection)
  const coarse = useMemo(() => isCoarsePointer(), [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: activeSection === 0 ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 left-0 right-0 z-20 text-center pointer-events-none font-data uppercase text-[11px] tracking-[0.3em]"
      style={{ color: 'var(--dim)' }}
    >
      {coarse ? 'two fingers to orbit · scroll to explore' : 'drag to orbit · scroll to descend'}
    </motion.div>
  )
}
