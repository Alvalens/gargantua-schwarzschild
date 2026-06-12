import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { BlackHole } from './BlackHole'

export function BlackHoleCanvas() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.5, 16], fov: 55 }}
      >
        <BlackHole />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={30} />
      </Canvas>
    </div>
  )
}
