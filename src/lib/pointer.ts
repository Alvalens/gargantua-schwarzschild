// True when the device's primary pointer is touch (phones, tablets). Used to
// decide input behavior: on touch, one finger scrolls the page and two fingers
// orbit the black hole; on desktop, mouse drag orbits and the wheel scrolls.
export function isCoarsePointer(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}
