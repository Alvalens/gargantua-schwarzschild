import { Canvas } from '@react-three/fiber'
import { BlackHole } from './BlackHole'

export function BlackHoleCanvas() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.5, 16], fov: 55 }}
      >
        <BlackHole />
      </Canvas>
    </div>
  )
}
