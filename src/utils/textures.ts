import * as THREE from 'three'

function canvas(size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return c
}

/** Procedural Spider-suit texture: red panels with black web webbing. */
export function makeSuitTexture(base = '#c8102e', line = '#0b0b12') {
  const size = 512
  const c = canvas(size)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // subtle panel shading
  const grd = ctx.createLinearGradient(0, 0, 0, size)
  grd.addColorStop(0, 'rgba(255,255,255,0.16)')
  grd.addColorStop(0.5, 'rgba(0,0,0,0.0)')
  grd.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = line
  ctx.lineWidth = 2.4
  const cx = size / 2
  const cy = size / 2
  const rays = 16
  // radial strands
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size)
    ctx.stroke()
  }
  // concentric sagging rings
  for (let r = 24; r < size * 0.95; r += 30) {
    ctx.beginPath()
    for (let i = 0; i <= rays; i++) {
      const a = (i / rays) * Math.PI * 2
      const sag = r * 0.94
      const mid = (a + Math.PI / rays) % (Math.PI * 2)
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.quadraticCurveTo(cx + Math.cos(mid - Math.PI / rays) * sag, cy + Math.sin(mid - Math.PI / rays) * sag, x, y)
    }
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  tex.anisotropy = 4
  return tex
}

/** Window grid used as emissive map for the city towers. */
export function makeWindowTexture() {
  const size = 256
  const c = canvas(size)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size, size)
  const cols = 10
  const rows = 20
  const w = size / cols
  const h = size / rows
  const palette = ['#ffd591', '#ffe9c2', '#9ad7ff', '#fff3d1', '#ff9b7a']
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (Math.random() > 0.52) continue
      ctx.fillStyle = palette[(Math.random() * palette.length) | 0]
      ctx.globalAlpha = 0.35 + Math.random() * 0.65
      ctx.fillRect(x * w + w * 0.22, y * h + h * 0.22, w * 0.56, h * 0.5)
    }
  }
  ctx.globalAlpha = 1
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/** Soft round sprite for particles / bokeh. */
export function makeSparkTexture() {
  const size = 128
  const c = canvas(size)
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,220,190,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}
