import { create } from 'zustand'

export type Chapter = {
  id: number
  kicker: string
  title: string
  body: string
}

export const CHAPTERS: Chapter[] = [
  {
    id: 0,
    kicker: 'Chapter 01 — Queens, 11:42 PM',
    title: 'THE CITY\nNEVER SLEEPS',
    body: 'Eight million people. One guy who can\'t stop answering the call.',
  },
  {
    id: 1,
    kicker: 'Chapter 02 — Threat Detected',
    title: 'SPIDER\nSENSE',
    body: 'A tingle at the base of the skull. Milliseconds before everything goes wrong.',
  },
  {
    id: 2,
    kicker: 'Chapter 03 — Kinetic Transit',
    title: 'THWIP.\nSWING. REPEAT.',
    body: 'Tensile web-fluid at 120 psi. Terminal velocity is just a suggestion.',
  },
  {
    id: 3,
    kicker: 'Chapter 04 — Anomaly',
    title: 'THE MULTIVERSE\nIS BLEEDING',
    body: 'Reality fractures over Midtown. Something came through. Something wearing his face.',
  },
  {
    id: 4,
    kicker: 'Chapter 05 — Final Stand',
    title: 'WHATEVER\nIT TAKES',
    body: 'He never asked to be the one. He never once put the mask down either.',
  },
  {
    id: 5,
    kicker: 'Only In Theaters',
    title: 'SPIDER-MAN\nWEB OF WORLDS',
    body: 'Experience it on the largest screen possible. Tickets are live now.',
  },
]

type AdState = {
  chapter: number
  setChapter: (c: number) => void
  soundOn: boolean
  toggleSound: () => void
  webShots: number
  registerShot: () => void
  spiderSense: number // timestamp of last trigger
  triggerSpiderSense: () => void
  ticketsOpen: boolean
  setTicketsOpen: (v: boolean) => void
  quality: 'high' | 'low'
  setQuality: (q: 'high' | 'low') => void
  loaded: boolean
  setLoaded: (v: boolean) => void
}

export const useAdStore = create<AdState>((set) => ({
  chapter: 0,
  setChapter: (c) => set((s) => (s.chapter === c ? s : { chapter: c })),
  soundOn: false,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  webShots: 0,
  registerShot: () => set((s) => ({ webShots: s.webShots + 1 })),
  spiderSense: 0,
  triggerSpiderSense: () => set({ spiderSense: performance.now() }),
  ticketsOpen: false,
  setTicketsOpen: (v) => set({ ticketsOpen: v }),
  quality: 'high',
  setQuality: (q) => set({ quality: q }),
  loaded: false,
  setLoaded: (v) => set({ loaded: v }),
}))

/** Mutable, non-reactive scroll state shared between the GSAP pipeline and the WebGL frame loop. */
export const scrollState = {
  progress: 0, // 0..1 across the whole ad viewport
  velocity: 0,
  chapterProgress: 0,
  pointerX: 0,
  pointerY: 0,
  glitch: 0, // 0..1 impulse
}
