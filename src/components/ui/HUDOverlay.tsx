/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX, Gauge, Activity, ChevronDown, TriangleAlert } from 'lucide-react'
import { CHAPTERS, scrollState, useAdStore } from '../../store/useAdStore'
import { playSpiderSense, playUi, useAudioController } from '../../hooks/useAudio'

const RELEASE = new Date('2026-07-03T00:00:00')

function useCountdown() {
  const [t, setT] = useState(() => RELEASE.getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setT(RELEASE.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const s = Math.max(0, Math.floor(t / 1000))
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

function useTelemetry() {
  const [fps, setFps] = useState(60)
  const [pct, setPct] = useState(0)
  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      frames++
      const now = performance.now()
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        setPct(Math.round(scrollState.progress * 100))
        frames = 0
        last = now
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return { fps, pct }
}

export default function HUDOverlay() {
  const chapter = useAdStore((s) => s.chapter)
  const soundOn = useAdStore((s) => s.soundOn)
  const toggleSound = useAdStore((s) => s.toggleSound)
  const quality = useAdStore((s) => s.quality)
  const setQuality = useAdStore((s) => s.setQuality)
  const webShots = useAdStore((s) => s.webShots)
  const spiderSense = useAdStore((s) => s.spiderSense)
  const setTicketsOpen = useAdStore((s) => s.setTicketsOpen)
  const unlockAudio = useAudioController()
  const { d, h, m, s } = useCountdown()
  const { fps, pct } = useTelemetry()
  const [alert, setAlert] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!spiderSense) return
    setAlert(true)
    if (soundOn) playSpiderSense()
    const id = setTimeout(() => setAlert(false), 2400)
    return () => clearTimeout(id)
  }, [spiderSense, soundOn])

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (barRef.current) barRef.current.style.transform = `scaleY(${scrollState.progress})`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const active = CHAPTERS[chapter] ?? CHAPTERS[0]
  const isFinal = chapter >= CHAPTERS.length - 1

  return (
    <div className="pointer-events-none fixed inset-0 z-50 select-none text-white">
      {/* halftone + scan texture */}
      <div className="absolute inset-0 opacity-[0.055] mix-blend-screen [background-image:radial-gradient(#fff_1px,transparent_1.4px)] [background-size:5px_5px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.75),transparent_22%,transparent_62%,rgba(0,0,0,0.85))]" />

      {/* spider-sense alert */}
      <AnimatePresence>
        {alert && (
          <>
            <motion.div
              key="pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.25, 0.7, 0.15] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, times: [0, 0.12, 0.3, 0.5, 1] }}
              className="absolute inset-0 shadow-[inset_0_0_180px_60px_rgba(255,25,45,0.55)]"
            />
            <motion.div
              key="tag"
              initial={{ opacity: 0, x: -20, skewX: -12 }}
              animate={{ opacity: 1, x: 0, skewX: -12 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute left-1/2 top-[18%] -translate-x-1/2 border border-red-500 bg-red-600/20 px-5 py-2 backdrop-blur-sm"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.35em] text-red-300">
                <TriangleAlert size={14} /> Spider-Sense Triggered
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* top bar */}
      <header className="absolute inset-x-0 top-0 flex items-start justify-between px-4 py-4 sm:px-8 sm:py-6">
        <div>
          <h1 className="text-2xl font-black uppercase italic leading-none tracking-tighter text-red-500 drop-shadow-[0_0_18px_rgba(255,45,63,0.6)] sm:text-4xl">
            Spider-Man
          </h1>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.55em] text-white/60 sm:text-[11px]">
            Web of Worlds
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2" data-ui>
          <button
            onClick={() => {
              unlockAudio()
              toggleSound()
              playUi(soundOn ? 240 : 660)
            }}
            className="flex items-center gap-2 border border-white/20 bg-black/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur transition hover:border-red-500 hover:text-red-400"
          >
            {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{soundOn ? 'Sound On' : 'Sound Off'}</span>
          </button>
          <button
            onClick={() => {
              setQuality(quality === 'high' ? 'low' : 'high')
              playUi(420)
            }}
            className="flex items-center gap-2 border border-white/20 bg-black/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur transition hover:border-red-500 hover:text-red-400"
          >
            <Gauge size={13} />
            <span className="hidden sm:inline">{quality === 'high' ? 'Ultra' : 'Perf'}</span>
          </button>
          <button
            onClick={() => {
              setTicketsOpen(true)
              playUi(700)
            }}
            className="hidden bg-red-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:scale-105 hover:bg-red-500 sm:block"
          >
            Get Tickets
          </button>
        </div>
      </header>

      {/* left telemetry rail */}
      <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 lg:block sm:left-8">
        <div className="flex items-center gap-3">
          <div className="relative h-52 w-[3px] bg-white/12">
            <div ref={barRef} className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-red-500 to-red-700" />
          </div>
          <div className="space-y-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/45">
            {CHAPTERS.map((c, i) => (
              <p key={c.id} className={i === chapter ? 'text-red-400' : ''}>
                {String(i + 1).padStart(2, '0')}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* right telemetry */}
      <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 space-y-3 text-right font-mono text-[10px] uppercase tracking-widest text-white/45 md:block sm:right-8">
        <Stat label="Render" value={`${fps} FPS`} good={fps >= 50} />
        <Stat label="Timeline" value={`${pct}%`} />
        <Stat label="Web Shots" value={String(webShots).padStart(3, '0')} />
        <Stat label="Pipeline" value={quality === 'high' ? 'BLOOM+CA' : 'LEAN'} />
      </div>

      {/* chapter captions */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-8 sm:pb-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl"
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.45em] text-red-500">{active.kicker}</p>
              <h2 className="whitespace-pre-line text-4xl font-black uppercase italic leading-[0.86] tracking-tighter drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
                {active.title}
              </h2>
              <p className="mt-3 max-w-md text-xs leading-relaxed text-white/60 sm:text-sm">{active.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-auto flex flex-col items-start gap-4 md:items-end" data-ui>
            <div className="flex gap-2">
              {[
                { v: d, l: 'Days' },
                { v: h, l: 'Hrs' },
                { v: m, l: 'Min' },
                { v: s, l: 'Sec' },
              ].map((u) => (
                <div key={u.l} className="min-w-[54px] border border-white/15 bg-black/60 px-2 py-2 text-center backdrop-blur">
                  <p className="font-mono text-lg font-bold leading-none text-white">{String(u.v).padStart(2, '0')}</p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-white/40">{u.l}</p>
                </div>
              ))}
            </div>
            <motion.button
              onClick={() => {
                setTicketsOpen(true)
                playUi(700)
              }}
              animate={isFinal ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ repeat: isFinal ? Infinity : 0, duration: 1.8 }}
              className="group relative overflow-hidden bg-red-600 px-8 py-4 text-xs font-black uppercase tracking-[0.35em] text-white shadow-[0_0_40px_rgba(255,45,63,0.45)] transition hover:bg-red-500"
            >
              <span className="relative z-10">Get Tickets</span>
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-0" />
            </motion.button>
            <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">July 3 · Only In Theaters</p>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <AnimatePresence>
        {chapter === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-40 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.4em] text-white/45 md:flex"
          >
            <span className="flex items-center gap-2">
              <Activity size={12} className="text-red-500" /> Scroll to swing · Click to sling a web
            </span>
            <motion.span animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
              <ChevronDown size={16} />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div>
      <p className="text-[8px] tracking-[0.35em] text-white/25">{label}</p>
      <p className={good === false ? 'text-amber-400' : 'text-white/80'}>{value}</p>
    </div>
  )
}
