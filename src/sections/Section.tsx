import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { SectionCopy } from './sectionsData'
import { useSimStore } from '../store/useSimStore'

interface SectionProps {
  copy: SectionCopy
  index: number
  total: number
}

const EASE = [0.16, 1, 0.3, 1] as const

export function Section({ copy, index, total }: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  const setActiveSection = useSimStore((s) => s.setActiveSection)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(index)
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index, setActiveSection])

  const isHero = index === 0
  const isEven = index % 2 === 0
  const accent = isEven ? 'var(--ember)' : 'var(--cherenkov)'
  const num = `0${index + 1}`
  const titleLines = copy.title.split('\n')

  return (
    <section
      ref={ref}
      id={copy.id}
      className={`relative h-screen overflow-hidden pointer-events-none flex ${
        isHero ? 'items-end pb-[16vh] justify-center' : 'items-center'
      } px-6 sm:px-12 lg:px-24`}
    >
      {/* Ghost numeral — overflows the edge behind the copy */}
      {!isHero && (
        <span
          aria-hidden
          className={`ghost-numeral absolute top-1/2 -translate-y-1/2 ${
            isEven ? '-left-[6vw]' : '-right-[6vw]'
          }`}
        >
          {num}
        </span>
      )}

      <div
        className={`relative ${
          isHero
            ? 'max-w-4xl text-center mx-auto'
            : isEven
              ? 'max-w-lg mr-auto text-left'
              : 'max-w-lg ml-auto text-right'
        }`}
      >
        {/* Local scrim: soft radial darkening so copy stays legible over the
            bloomed disk. Reads as cinematic falloff, not a card. */}
        <div
          aria-hidden
          className="absolute -inset-x-20 -inset-y-14 -z-10"
          style={{
            background:
              'radial-gradient(closest-side, rgba(0,0,0,0.62), rgba(0,0,0,0.28) 55%, transparent 100%)',
          }}
        />
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.35em' }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="font-data uppercase text-[11px] mb-6"
          style={{ color: accent }}
        >
          {copy.eyebrow}
        </motion.p>

        <h2
          className={`font-display font-semibold leading-[1.05] mb-7 ${
            isHero ? 'text-[clamp(2.5rem,6vw,4.5rem)]' : 'text-[clamp(2.25rem,5vw,4rem)]'
          }`}
          style={{ color: 'var(--paper)' }}
        >
          {titleLines.map((line, i) => (
            <motion.span
              key={i}
              className="block"
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: EASE }}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
          className={`text-[17px] leading-relaxed max-w-[34ch] ${
            isHero ? 'mx-auto' : isEven ? '' : 'ml-auto'
          }`}
          style={{ color: 'var(--dim)', textShadow: '0 1px 16px rgba(0,0,0,0.85)' }}
        >
          {copy.body}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
          className="font-data text-[11px] tracking-[0.2em] mt-10"
          style={{ color: 'var(--dim)' }}
        >
          {num} / 0{total}
        </motion.p>
      </div>
    </section>
  )
}
