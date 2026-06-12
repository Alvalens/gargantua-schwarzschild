import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { TOUCH } from 'three'
import { BlackHole } from './BlackHole'
import { ScrollCameraRig } from './ScrollCameraRig'
import { useSimStore } from '../store/useSimStore'
import { detectQuality } from '../lib/detectQuality'
import { isCoarsePointer } from '../lib/pointer'
import { ART, QUALITY } from '../lib/presets'

export function BlackHoleCanvas() {
  const quality = useSimStore((s) => s.quality)
  const setQuality = useSimStore((s) => s.setQuality)
  const [active, setActive] = useState(() => (typeof document !== 'undefined' ? !document.hidden : true))
  const dragging = useRef(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const coarse = useMemo(() => isCoarsePointer(), [])

  useEffect(() => { setQuality(detectQuality()) }, [setQuality])

  useEffect(() => {
    const onVis = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // On touch devices, reserve one finger for native page scrolling and orbit
  // only with two. Two things are needed, both fighting OrbitControls which
  // sets them on connect (and whose timing races with this effect):
  //   1. touch-action: pan-y on the canvas (OrbitControls forces it to `none`),
  //      so the browser can scroll the narrative with one finger. A
  //      MutationObserver keeps it pinned to pan-y if OrbitControls re-sets it.
  //   2. controls.touches.ONE = none so OrbitControls ignores single-finger
  //      gestures (the `touches` prop drops an `undefined` ONE), TWO = rotate.
  useEffect(() => {
    if (!coarse) return
    const wrap = wrapRef.current
    if (!wrap) return

    let observer: MutationObserver | null = null
    let raf = 0
    let tries = 0

    const setupTouches = () => {
      const controls = controlsRef.current
      if (controls) {
        controls.touches.ONE = undefined as unknown as TOUCH // single finger → page scroll
        controls.touches.TWO = TOUCH.ROTATE                  // two fingers → orbit
      }
    }

    const init = () => {
      const canvas = wrap.querySelector('canvas')
      if (!canvas) {
        if (tries++ < 60) raf = requestAnimationFrame(init)
        return
      }
      const pin = () => { if (canvas.style.touchAction !== 'pan-y') canvas.style.touchAction = 'pan-y' }
      pin()
      observer = new MutationObserver(pin) // re-pin if OrbitControls sets touch-action: none
      observer.observe(canvas, { attributes: true, attributeFilter: ['style'] })
      setupTouches()
    }

    init()
    // touches may not be ready on the first frame; re-assert briefly.
    const t = window.setInterval(setupTouches, 100)
    window.setTimeout(() => window.clearInterval(t), 1000)

    return () => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
      window.clearInterval(t)
    }
  }, [coarse])

  const scale = QUALITY[quality].resolutionScale
  const dpr = scale * (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1)
  return (
    <div ref={wrapRef} className="fixed inset-0 z-0">
      <Canvas
        dpr={dpr}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.5, 16], fov: 55 }}
      >
        <BlackHole />
        {/* ART.bloom is the single intensity knob. High luminance threshold keeps
            the shadow and copy untouched; only filaments + photon ring glow. */}
        <EffectComposer>
          <Bloom
            intensity={ART.bloom * 1.3}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
        </EffectComposer>
        <ScrollCameraRig dragging={dragging} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableZoom={false}
          minDistance={3}
          maxDistance={30}
          onStart={() => { dragging.current = true }}
          onEnd={() => { dragging.current = false }}
        />
      </Canvas>
    </div>
  )
}
