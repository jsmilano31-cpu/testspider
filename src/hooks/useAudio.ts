/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from 'react'
import { useAdStore } from '../store/useAdStore'

/**
 * Procedural audio engine — every SFX is synthesised with the WebAudio API,
 * so the ad ships with zero audio payload.
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null

function ensureCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function noiseBuffer(c: AudioContext, seconds = 0.5) {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

export function playThwip() {
  const c = ensureCtx()
  if (!c || !master) return
  const t = c.currentTime
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 0.35)
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 6
  filter.frequency.setValueAtTime(3800, t)
  filter.frequency.exponentialRampToValueAtTime(600, t + 0.24)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.7, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
  src.connect(filter).connect(g).connect(master)
  src.start(t)
  src.stop(t + 0.35)
}

export function playSpiderSense() {
  const c = ensureCtx()
  if (!c || !master) return
  const t = c.currentTime
  for (let i = 0; i < 3; i++) {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'triangle'
    const start = t + i * 0.11
    o.frequency.setValueAtTime(1500 + i * 260, start)
    o.frequency.exponentialRampToValueAtTime(700, start + 0.09)
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(0.22, start + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.1)
    o.connect(g).connect(master)
    o.start(start)
    o.stop(start + 0.12)
  }
}

export function playUi(freq = 420) {
  const c = ensureCtx()
  if (!c || !master) return
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'square'
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + 0.1)
}

/** Low, evolving city drone bed. */
function startAmbience() {
  const c = ensureCtx()
  if (!c || !master) return
  const t = c.currentTime
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 4)
  src.loop = true
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 260
  const g = c.createGain()
  g.gain.value = 0.09
  src.connect(lp).connect(g).connect(master)
  src.start(t)

  const o = c.createOscillator()
  o.type = 'sawtooth'
  o.frequency.value = 47
  const og = c.createGain()
  og.gain.value = 0.045
  const olp = c.createBiquadFilter()
  olp.type = 'lowpass'
  olp.frequency.value = 180
  o.connect(olp).connect(og).connect(master)
  o.start(t)
}

let ambienceStarted = false

export function useAudioController() {
  const soundOn = useAdStore((s) => s.soundOn)

  useEffect(() => {
    const c = ensureCtx()
    if (!c || !master) return
    if (soundOn && !ambienceStarted) {
      startAmbience()
      ambienceStarted = true
    }
    const target = soundOn ? 0.5 : 0.0001
    master.gain.cancelScheduledValues(c.currentTime)
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), c.currentTime)
    master.gain.exponentialRampToValueAtTime(target, c.currentTime + 0.6)
  }, [soundOn])

  return useCallback(() => ensureCtx(), [])
}
