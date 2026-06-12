import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ShaderMaterial, type PerspectiveCamera } from 'three'
import vert from './shaders/blackhole.vert.glsl'
import frag from './shaders/blackhole.frag.glsl'
import { useInitialUniforms } from './useBlackHoleUniforms'

export function BlackHole() {
  const matRef = useRef<ShaderMaterial>(null)
  const uniforms = useInitialUniforms()
  const { size, camera } = useThree()

  useFrame((_, delta) => {
    const m = matRef.current
    if (!m) return
    const cam = camera as PerspectiveCamera
    m.uniforms.uTime.value += delta
    m.uniforms.uResolution.value = [size.width, size.height]
    m.uniforms.uCamPos.value.copy(cam.position)
    m.uniforms.uCamToWorld.value.copy(cam.matrixWorld)
    m.uniforms.uTanFov.value = Math.tan((cam.fov * Math.PI) / 180 / 2)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
