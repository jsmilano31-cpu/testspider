/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/immutability */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'

type Props = {
  handRef: React.MutableRefObject<THREE.Object3D | null>
  anchorRef: React.MutableRefObject<THREE.Vector3>
  segments?: number
  color?: string
}

/**
 * Verlet-integrated web strand. Runs a lightweight constraint solver every frame
 * (distance constraints + gravity + wind) — deterministic, allocation-free and
 * far cheaper than a full rigid-body solve for a single rope.
 */
export default function WebRopePhysics({ handRef, anchorRef, segments = 18, color = '#eaf6ff' }: Props) {
  const lineRef = useRef<any>(null)
  const splat = useRef<THREE.Mesh>(null!)

  const pts = useMemo(() => Array.from({ length: segments }, () => new THREE.Vector3()), [segments])
  const prev = useMemo(() => Array.from({ length: segments }, () => new THREE.Vector3()), [segments])
  const initialised = useRef(false)
  const hand = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, rawDelta) => {
    const obj = handRef.current
    if (!obj || !lineRef.current) return
    obj.getWorldPosition(hand)
    const anchor = anchorRef.current
    const delta = Math.min(rawDelta, 1 / 30)
    const t = state.clock.elapsedTime

    if (!initialised.current) {
      for (let i = 0; i < segments; i++) {
        const a = i / (segments - 1)
        pts[i].lerpVectors(anchor, hand, a)
        prev[i].copy(pts[i])
      }
      initialised.current = true
    }

    // integrate
    const gravity = -16 * delta * delta
    for (let i = 1; i < segments - 1; i++) {
      tmp.copy(pts[i])
      pts[i].x += (pts[i].x - prev[i].x) * 0.94 + Math.sin(t * 2.2 + i) * 0.0025
      pts[i].y += (pts[i].y - prev[i].y) * 0.94 + gravity
      pts[i].z += (pts[i].z - prev[i].z) * 0.94
      prev[i].copy(tmp)
    }
    pts[0].copy(anchor)
    pts[segments - 1].copy(hand)

    // solve distance constraints
    const rest = anchor.distanceTo(hand) / (segments - 1)
    for (let k = 0; k < 6; k++) {
      for (let i = 0; i < segments - 1; i++) {
        const a = pts[i]
        const b = pts[i + 1]
        tmp.subVectors(b, a)
        const d = tmp.length() || 0.0001
        const diff = (d - rest) / d
        const wA = i === 0 ? 0 : 0.5
        const wB = i + 1 === segments - 1 ? 0 : 0.5
        const total = wA + wB || 1
        a.addScaledVector(tmp, diff * (wA / total))
        b.addScaledVector(tmp, -diff * (wB / total))
      }
      pts[0].copy(anchor)
      pts[segments - 1].copy(hand)
    }

    // write straight into the interleaved instance buffer (zero allocation)
    const attr = lineRef.current.geometry?.attributes?.instanceStart
    if (attr) {
      const buf = attr.data
      const arr = buf.array as Float32Array
      for (let i = 0; i < segments - 1; i++) {
        const o = i * 6
        arr[o] = pts[i].x
        arr[o + 1] = pts[i].y
        arr[o + 2] = pts[i].z
        arr[o + 3] = pts[i + 1].x
        arr[o + 4] = pts[i + 1].y
        arr[o + 5] = pts[i + 1].z
      }
      buf.needsUpdate = true
    }
    if (splat.current) {
      splat.current.position.copy(anchor)
      splat.current.lookAt(state.camera.position)
      const pulse = 1 + Math.sin(t * 6) * 0.06
      splat.current.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      <Line
        ref={lineRef}
        points={pts}
        color={color}
        lineWidth={2.4}
        transparent
        opacity={0.95}
        toneMapped={false}
        frustumCulled={false}
      />
      <mesh ref={splat}>
        <circleGeometry args={[0.45, 14]} />
        <meshBasicMaterial color="#dff1ff" transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  )
}
