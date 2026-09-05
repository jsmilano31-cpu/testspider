import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAdStore } from '../../store/useAdStore'
import { playThwip, useAudioController } from '../../hooks/useAudio'

const STEPS = [
  'Compiling shader passes',
  'Decoding hero geometry',
  'Spooling web-fluid cartridges',
  'Calibrating spider-sense',
  'Rendering Manhattan',
]

export default function Preloader() {
  const [p, setP] = useState(0)
  const [ready, setReady] = useState(false)
  const [gone, setGone] = useState(false)
  const toggleSound = useAdStore((s) => s.toggleSound)
  const unlock = useAudioController()

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const loop = () => {
      const t = Math.min(1, (performance.now() - start) / 2200)
      setP(Math.round(t * 100))
      if (t < 1) raf = requestAnimationFrame(loop)
      else setReady(true)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((p / 100) * STEPS.length))]

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          data-ui
          exit={{ opacity: 0, filter: 'blur(14px)' }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#05060c] px-6 text-white"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1.4px)] [background-size:5px_5px]" />
          <svg viewBox="0 0 200 200" className="h-24 w-24 text-red-500">
            <g fill="none" stroke="currentColor" strokeWidth="2">
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2
                return <line key={i} x1="100" y1="100" x2={100 + Math.cos(a) * 92} y2={100 + Math.sin(a) * 92} />
              })}
              {[22, 44, 66, 88].map((r, ri) => (
                <motion.circle
                  key={r}
                  cx="100"
                  cy="100"
                  r={r}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, delay: ri * 0.18 }}
                />
              ))}
            </g>
          </svg>

          <h1 className="mt-8 text-3xl font-black uppercase italic tracking-tighter text-white sm:text-5xl">
            Spider-Man <span className="text-red-500">Web of Worlds</span>
          </h1>

          <div className="mt-8 w-full max-w-md">
            <div className="h-[3px] w-full bg-white/10">
              <motion.div className="h-full bg-red-500" style={{ width: `${p}%` }} />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              <span>{step}</span>
              <span>{String(p).padStart(3, '0')}%</span>
            </div>
          </div>

          <motion.button
            disabled={!ready}
            onClick={() => {
              unlock()
              toggleSound()
              playThwip()
              setGone(true)
            }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0.25, y: 8 }}
            className="mt-10 bg-red-600 px-10 py-4 text-xs font-black uppercase tracking-[0.4em] text-white transition hover:bg-red-500 disabled:cursor-wait"
          >
            Enter With Sound
          </motion.button>
          <button
            disabled={!ready}
            onClick={() => setGone(true)}
            className="mt-3 text-[10px] uppercase tracking-[0.35em] text-white/35 transition hover:text-white/70"
          >
            Continue muted
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
