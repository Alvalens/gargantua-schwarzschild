import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'
import { useSimStore } from '../store/useSimStore'
import { cameraPresetAt } from './cameraPath'

export function ScrollCameraRig({ dragging }: { dragging: React.RefObject<boolean> }) {
  const target = useRef(new Vector3())

  useFrame(({ camera }) => {
    if (dragging.current) return // free orbit while the user drags
    const progress = useSimStore.getState().scrollProgress
    const preset = cameraPresetAt(progress)
    target.current.set(preset.position[0], preset.position[1], preset.position[2])
    camera.position.lerp(target.current, 0.05)
    const cam = camera as PerspectiveCamera
    if (Math.abs(cam.fov - preset.fov) > 0.01) {
      cam.fov += (preset.fov - cam.fov) * 0.05
      cam.updateProjectionMatrix()
    }
    camera.lookAt(0, 0, 0)
  })

  return null
}
