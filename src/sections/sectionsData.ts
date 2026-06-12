export interface SectionCopy {
  id: string
  eyebrow: string
  title: string
  body: string
}

export const SECTIONS: SectionCopy[] = [
  {
    id: 'hero',
    eyebrow: 'Schwarzschild · raymarched in real time',
    title: 'A Black Hole,\nRendered in Real Light',
    body: 'Every pixel traces a photon bent by gravity. Drag to orbit. Scroll to descend.',
  },
  {
    id: 'lensing',
    eyebrow: 'Gravitational Lensing',
    title: 'Light Has\nNo Choice',
    body: "Mass curves spacetime, and light follows the curve. The disk's far side bends up and over the shadow — you are seeing behind the hole.",
  },
  {
    id: 'disk',
    eyebrow: 'The Accretion Disk',
    title: 'Matter at the\nEdge of Forever',
    body: 'Superheated gas spirals inward at relativistic speed, glowing hotter and bluer as it approaches the point of no return.',
  },
  {
    id: 'doppler',
    eyebrow: 'Relativistic Beaming',
    title: 'One Side\nBurns Brighter',
    body: 'Material racing toward you is blueshifted and amplified; the receding side dims to ember. The asymmetry is not a style choice — it is physics.',
  },
  {
    id: 'physics',
    eyebrow: "How It's Built",
    title: 'No Mesh.\nJust Math.',
    body: 'A single GLSL fragment shader marches every ray through curved spacetime. React and react-three-fiber drive the camera. Built by Alvalen Shafel.',
  },
]
