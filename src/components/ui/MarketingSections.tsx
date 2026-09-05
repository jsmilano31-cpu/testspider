import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star, Film, Play, Camera, Send, MonitorPlay } from 'lucide-react'
import poster from '../../assets/poster.jpg'
import { useAdStore } from '../../store/useAdStore'
import { playUi } from '../../hooks/useAudio'

const QUOTES = [
  { t: 'A dizzying, physics-defying spectacle. The swing sequences are pure adrenaline.', s: 'Empire' },
  { t: 'The most emotionally grounded Spider-Man in a decade.', s: 'Variety' },
  { t: 'Multiversal mayhem executed with genuine craft. See it on the biggest screen you can find.', s: 'IGN' },
]

const CAST = [
  { n: 'Peter Parker', a: 'The kid from Queens', c: 'from-red-600 to-red-900' },
  { n: 'Gwen Stacy', a: 'Anomaly, Earth-65', c: 'from-cyan-500 to-indigo-900' },
  { n: 'Dr. Otto Octavius', a: 'Fractured genius', c: 'from-emerald-500 to-slate-900' },
  { n: 'The Weaver', a: 'Keeper of the strands', c: 'from-fuchsia-500 to-purple-950' },
]

const FORMATS = ['IMAX 70MM', 'DOLBY CINEMA', '4DX', 'REALD 3D', 'SCREENX']

export default function MarketingSections() {
  const setTicketsOpen = useAdStore((s) => s.setTicketsOpen)

  return (
    <div className="relative z-[45] bg-[#05060c] text-white" data-ui>
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#fff_1px,transparent_1.4px)] [background-size:5px_5px]" />

      {/* poster / synopsis */}
      <section className="relative mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-[minmax(0,380px)_1fr] md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="group relative"
        >
          <Image
            src={poster}
            alt="Spider-Man: Web of Worlds poster"
            width={760}
            height={1013}
            className="w-full border border-white/10 shadow-[0_30px_120px_rgba(255,45,63,0.18)] transition duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-red-400">In Theaters July 3</p>
            <p className="mt-1 text-2xl font-black uppercase italic leading-none">Web of Worlds</p>
          </div>
          <button
            onClick={() => playUi(520)}
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/40 backdrop-blur transition hover:scale-110 hover:border-red-500 hover:text-red-400"
            aria-label="Play trailer"
          >
            <Play size={20} className="ml-1" />
          </button>
        </motion.div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-500">The Story</p>
          <h3 className="mt-4 text-4xl font-black uppercase italic leading-[0.9] tracking-tighter sm:text-6xl">
            One city.
            <br />
            Infinite versions
            <br />
            of the same kid.
          </h3>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            When a collider accident tears a hole above Midtown, every Spider-Man who ever lived starts bleeding into
            one timeline — and only the kid from Queens can stitch it back together. But every strand he pulls costs
            him someone he loves. A story about responsibility, told at 200 feet per second.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Runtime', '2H 21M'],
              ['Rating', 'PG-13'],
              ['Release', 'JUL 3'],
              ['Studio', 'ARACHNID'],
            ].map(([k, v]) => (
              <div key={k} className="border-l border-red-600/50 pl-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">{k}</p>
                <p className="mt-1 font-mono text-lg font-bold">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setTicketsOpen(true)
                playUi(700)
              }}
              className="bg-red-600 px-8 py-4 text-xs font-black uppercase tracking-[0.35em] transition hover:scale-105 hover:bg-red-500"
            >
              Get Tickets
            </button>
            <button
              onClick={() => playUi(400)}
              className="border border-white/25 px-8 py-4 text-xs font-black uppercase tracking-[0.35em] text-white/70 transition hover:border-red-500 hover:text-white"
            >
              Watch Trailer
            </button>
          </div>
        </div>
      </section>

      {/* quotes */}
      <section className="border-y border-white/10 bg-black/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <motion.blockquote
              key={q.s}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <div className="flex gap-1 text-red-500">
                {Array.from({ length: 5 }, (_, j) => (
                  <Star key={j} size={13} fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-sm italic leading-relaxed text-white/75">“{q.t}”</p>
              <footer className="mt-3 text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">— {q.s}</footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* cast */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-500">The Web</p>
        <h3 className="mt-3 text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">Characters</h3>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAST.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              className="group relative aspect-[3/4] overflow-hidden border border-white/10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.c} opacity-70 transition duration-500 group-hover:opacity-100`} />
              <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(45deg,rgba(0,0,0,0.6)_0px,rgba(0,0,0,0.6)_1px,transparent_1px,transparent_7px)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <p className="text-lg font-black uppercase italic leading-tight">{c.n}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/55">{c.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* formats */}
      <section className="border-y border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-5 px-6 py-10">
          <Film size={16} className="text-red-500" />
          {FORMATS.map((f) => (
            <span key={f} className="text-xs font-black uppercase tracking-[0.35em] text-white/45 transition hover:text-white">
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="relative overflow-hidden px-6 py-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,45,63,0.35),transparent_60%)]" />
        <motion.h3
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative text-5xl font-black uppercase italic leading-[0.85] tracking-tighter sm:text-8xl"
        >
          Swing in
          <br />
          <span className="text-red-500">July 3</span>
        </motion.h3>
        <button
          onClick={() => {
            setTicketsOpen(true)
            playUi(700)
          }}
          className="relative mt-10 bg-red-600 px-12 py-5 text-sm font-black uppercase tracking-[0.4em] shadow-[0_0_60px_rgba(255,45,63,0.5)] transition hover:scale-105 hover:bg-red-500"
        >
          Book Now
        </button>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-lg font-black uppercase italic tracking-tighter text-red-500">Spider-Man</p>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">
              © 2026 Arachnid Pictures · Interactive WebGL Campaign
            </p>
          </div>
          <div className="flex gap-4 text-white/40">
            {[Camera, Send, MonitorPlay].map((Icon, i) => (
              <button key={i} className="transition hover:text-red-500" aria-label="social">
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
