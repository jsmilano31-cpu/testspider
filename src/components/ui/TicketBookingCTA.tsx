import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, MapPin, Clock, Ticket, Check, Sparkles } from 'lucide-react'
import { useAdStore } from '../../store/useAdStore'
import { playUi, playThwip } from '../../hooks/useAudio'

const THEATERS = [
  { id: 't1', name: 'AMC Empire 25', city: 'Times Square, NY', dist: '0.4 mi' },
  { id: 't2', name: 'Regal Union Square', city: 'Manhattan, NY', dist: '1.2 mi' },
  { id: 't3', name: 'Alamo Drafthouse', city: 'Brooklyn, NY', dist: '3.8 mi' },
]
const FORMATS = [
  { id: 'imax', label: 'IMAX 70MM', price: 27.5 },
  { id: 'dolby', label: 'DOLBY CINEMA', price: 24 },
  { id: 'std', label: 'STANDARD', price: 17.5 },
]
const TIMES = ['4:15 PM', '6:40 PM', '8:05 PM', '9:30 PM', '11:55 PM']
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLS = 10

export default function TicketBookingCTA() {
  const open = useAdStore((s) => s.ticketsOpen)
  const setOpen = useAdStore((s) => s.setTicketsOpen)
  const [theater, setTheater] = useState('t1')
  const [format, setFormat] = useState('imax')
  const [time, setTime] = useState('8:05 PM')
  const [seats, setSeats] = useState<string[]>(['D5', 'D6'])
  const [done, setDone] = useState(false)

  const taken = useMemo(() => {
    const set = new Set<string>()
    let n = 7919
    for (let i = 0; i < 22; i++) {
      n = (n * 31 + 17) % 9973
      set.add(`${ROWS[n % ROWS.length]}${(n % COLS) + 1}`)
    }
    return set
  }, [])

  const price = FORMATS.find((f) => f.id === format)!.price
  const total = (price * seats.length + 2.5).toFixed(2)

  const toggleSeat = (id: string) => {
    if (taken.has(id)) return
    playUi(seats.includes(id) ? 300 : 620)
    setSeats((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-ui
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ y: 40, scale: 0.94, opacity: 0, rotateX: 8 }}
            animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ y: 30, scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-red-600/40 bg-[#07070d]/95 shadow-[0_0_80px_rgba(255,45,63,0.25)]"
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />

            <header className="relative flex items-start justify-between border-b border-white/10 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-red-500">Now Booking</p>
                <h3 className="mt-1 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
                  Spider-Man: Web of Worlds
                </h3>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/40">
                  PG-13 · 2H 21M · Action / Sci-Fi
                </p>
              </div>
              <button
                onClick={() => {
                  playUi(220)
                  setOpen(false)
                }}
                className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-red-500 hover:text-red-400"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>

            {!done ? (
              <div className="relative space-y-6 px-5 py-6 sm:px-7">
                <section>
                  <Label icon={<MapPin size={13} />} text="Select Theater" />
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {THEATERS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          playUi(520)
                          setTheater(t.id)
                        }}
                        className={`border px-3 py-3 text-left transition ${
                          theater === t.id
                            ? 'border-red-500 bg-red-600/15 shadow-[inset_0_0_30px_rgba(255,45,63,0.15)]'
                            : 'border-white/12 hover:border-white/35'
                        }`}
                      >
                        <p className="text-sm font-bold text-white">{t.name}</p>
                        <p className="text-[11px] text-white/45">{t.city}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-red-400">{t.dist}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label icon={<Sparkles size={13} />} text="Format" />
                    <div className="mt-3 space-y-2">
                      {FORMATS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            playUi(480)
                            setFormat(f.id)
                          }}
                          className={`flex w-full items-center justify-between border px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                            format === f.id ? 'border-red-500 bg-red-600/15 text-white' : 'border-white/12 text-white/60 hover:border-white/35'
                          }`}
                        >
                          <span>{f.label}</span>
                          <span className="text-red-400">${f.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label icon={<Clock size={13} />} text="Showtime · Fri, Jul 3" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {TIMES.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            playUi(560)
                            setTime(t)
                          }}
                          className={`border px-3 py-2 text-xs font-bold tracking-wider transition ${
                            time === t ? 'border-red-500 bg-red-600 text-white' : 'border-white/12 text-white/60 hover:border-white/35'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <Label icon={<Ticket size={13} />} text="Choose Seats" />
                  <div className="mt-3 border border-white/10 bg-black/50 p-4">
                    <div className="mx-auto mb-4 h-1 w-2/3 rounded-full bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
                    <p className="mb-3 text-center text-[9px] uppercase tracking-[0.5em] text-white/30">Screen</p>
                    <div className="flex flex-col items-center gap-1.5">
                      {ROWS.map((r) => (
                        <div key={r} className="flex gap-1.5">
                          {Array.from({ length: COLS }, (_, i) => {
                            const id = `${r}${i + 1}`
                            const isTaken = taken.has(id)
                            const sel = seats.includes(id)
                            return (
                              <button
                                key={id}
                                onClick={() => toggleSeat(id)}
                                disabled={isTaken}
                                title={id}
                                className={`h-4 w-4 rounded-sm transition sm:h-5 sm:w-5 ${
                                  isTaken
                                    ? 'cursor-not-allowed bg-white/8'
                                    : sel
                                      ? 'bg-red-500 shadow-[0_0_10px_rgba(255,45,63,0.8)]'
                                      : 'bg-white/25 hover:bg-white/50'
                                }`}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-center gap-5 text-[10px] uppercase tracking-widest text-white/40">
                      <Legend className="bg-white/25" label="Open" />
                      <Legend className="bg-red-500" label="Yours" />
                      <Legend className="bg-white/8" label="Taken" />
                    </div>
                  </div>
                </section>

                <footer className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-white/50">
                    <p>
                      <span className="text-white/80">{seats.length}</span> seat(s){' '}
                      {seats.length > 0 && <span className="text-red-400">{seats.join(' · ')}</span>}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest">Incl. $2.50 booking fee</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-black text-white">${total}</p>
                    <button
                      disabled={seats.length === 0}
                      onClick={() => {
                        playThwip()
                        setDone(true)
                      }}
                      className="bg-red-600 px-7 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                    >
                      Lock It In
                    </button>
                  </div>
                </footer>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center px-6 py-14 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 text-red-500 shadow-[0_0_40px_rgba(255,45,63,0.6)]">
                  <Check size={30} />
                </div>
                <h4 className="mt-6 text-3xl font-black uppercase italic text-white">Seats Secured</h4>
                <p className="mt-2 max-w-sm text-sm text-white/50">
                  {THEATERS.find((t) => t.id === theater)!.name} · {FORMATS.find((f) => f.id === format)!.label} · {time}
                  <br />
                  Seats {seats.join(', ')} — a confirmation web has been slung to your inbox.
                </p>
                <div className="mt-7 grid grid-cols-8 gap-1 opacity-80">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div key={i} className={`h-3 w-3 ${(i * 7 + (i % 5)) % 3 === 0 ? 'bg-white' : 'bg-white/10'}`} />
                  ))}
                </div>
                <button
                  onClick={() => {
                    setDone(false)
                    setOpen(false)
                  }}
                  className="mt-8 border border-white/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70 transition hover:border-red-500 hover:text-white"
                >
                  Back to the City
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Label({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">
      <span className="text-red-500">{icon}</span>
      {text}
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  )
}
