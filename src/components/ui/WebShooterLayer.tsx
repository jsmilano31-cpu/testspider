import { useEffect, useRef } from 'react'
import { scrollState, useAdStore } from '../../store/useAdStore'
import { playThwip } from '../../hooks/useAudio'

type Shot = { x: number; y: number; ox: number; oy: number; born: number; seed: number }

/**
 * DOM-space web-shooter. A 2D canvas layered over the WebGL viewport draws the
 * strand + splat so it reads crisply at any DPI without touching the 3D pipeline.
 */
export default function WebShooterLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const shots = useRef<Shot[]>([])
  const registerShot = useAdStore((s) => s.registerShot)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-ui]')) return
      const ox = window.innerWidth * 0.5 + (Math.random() > 0.5 ? 90 : -90)
      const oy = window.innerHeight + 40
      shots.current.push({ x: e.clientX, y: e.clientY, ox, oy, born: performance.now(), seed: Math.random() * 100 })
      if (shots.current.length > 12) shots.current.shift()
      registerShot()
      scrollState.glitch = Math.min(1, scrollState.glitch + 0.45)
      playThwip()
    }
    window.addEventListener('pointerdown', onDown)

    const onMove = (e: PointerEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
    }
    window.addEventListener('pointermove', onMove)

    const draw = () => {
      raf = requestAnimationFrame(draw)
      const now = performance.now()
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      shots.current = shots.current.filter((s) => now - s.born < 2600)
      for (const s of shots.current) {
        const age = (now - s.born) / 2600
        const shoot = Math.min(1, age / 0.12)
        const alpha = 1 - Math.pow(age, 2.2)
        const tx = s.ox + (s.x - s.ox) * shoot
        const ty = s.oy + (s.y - s.oy) * shoot

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.strokeStyle = '#eaf6ff'
        ctx.lineWidth = 2
        ctx.shadowBlur = 12
        ctx.shadowColor = 'rgba(180,220,255,0.9)'
        ctx.beginPath()
        ctx.moveTo(s.ox, s.oy)
        const midX = (s.ox + tx) / 2 + Math.sin(s.seed + age * 6) * 26
        const midY = (s.oy + ty) / 2 + 40
        ctx.quadraticCurveTo(midX, midY, tx, ty)
        ctx.stroke()

        // splat
        if (shoot >= 1) {
          const r = 10 + (1 - Math.pow(1 - Math.min(1, (age - 0.12) / 0.18), 3)) * 22
          ctx.globalAlpha = alpha * 0.9
          ctx.lineWidth = 1.6
          for (let i = 0; i < 9; i++) {
            const a = (i / 9) * Math.PI * 2 + s.seed
            ctx.beginPath()
            ctx.moveTo(s.x, s.y)
            ctx.lineTo(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r)
            ctx.stroke()
          }
          for (let ring = 1; ring <= 3; ring++) {
            const rr = (r / 3) * ring
            ctx.beginPath()
            for (let i = 0; i <= 9; i++) {
              const a = (i / 9) * Math.PI * 2 + s.seed
              const x = s.x + Math.cos(a) * rr
              const y = s.y + Math.sin(a) * rr
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.stroke()
          }
        }
        ctx.restore()
      }
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
    }
  }, [registerShot])

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" />
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden h-10 w-10 md:block"
        style={{ willChange: 'transform' }}
      >
        <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full border border-red-500/70" />
        <div className="absolute inset-[30%] rounded-full bg-red-500/80 shadow-[0_0_12px_rgba(255,45,63,0.9)]" />
        <div className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-red-500/80" />
        <div className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-red-500/80" />
        <div className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-red-500/80" />
        <div className="absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-red-500/80" />
      </div>
    </>
  )
}
