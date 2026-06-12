import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { BlackHole } from './BlackHole'
import { useSimStore } from '../store/useSimStore'
import { detectQuality } from '../lib/detectQuality'
import { QUALITY } from '../lib/presets'

export function BlackHoleCanvas() {
  const quality = useSimStore((s) => s.quality)
  const setQuality = useSimStore((s) => s.setQuality)
  const [active, setActive] = useState(() => (typeof document !== 'undefined' ? !document.hidden : true))

  useEffect(() => { setQuality(detectQuality()) }, [setQuality])

  useEffect(() => {
    const onVis = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const scale = QUALITY[quality].resolutionScale
  const dpr = scale * (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1)
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={dpr}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.5, 16], fov: 55 }}
      >
        <BlackHole />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={30} />
      </Canvas>
    </div>
  )
}
