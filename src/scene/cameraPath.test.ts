import { describe, it, expect } from 'vitest'
import { cameraPresetAt, CAMERA_KEYFRAMES } from './cameraPath'

describe('cameraPresetAt', () => {
  it('returns the first keyframe at progress 0', () => {
    const p = cameraPresetAt(0)
    expect(p.position).toEqual(CAMERA_KEYFRAMES[0].position)
  })

  it('returns the last keyframe at progress 1', () => {
    const last = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1]
    const p = cameraPresetAt(1)
    expect(p.position).toEqual(last.position)
  })

  it('interpolates the midpoint between two keyframes', () => {
    // two keyframes span [0, t1]; halfway should be the average
    const t1 = CAMERA_KEYFRAMES[1].at
    const mid = cameraPresetAt(t1 / 2)
    const a = CAMERA_KEYFRAMES[0].position
    const b = CAMERA_KEYFRAMES[1].position
    expect(mid.position[0]).toBeCloseTo((a[0] + b[0]) / 2, 5)
    expect(mid.position[1]).toBeCloseTo((a[1] + b[1]) / 2, 5)
    expect(mid.position[2]).toBeCloseTo((a[2] + b[2]) / 2, 5)
  })

  it('clamps progress outside [0,1]', () => {
    expect(cameraPresetAt(-1).position).toEqual(CAMERA_KEYFRAMES[0].position)
    expect(cameraPresetAt(2).position).toEqual(
      CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].position,
    )
  })
})
