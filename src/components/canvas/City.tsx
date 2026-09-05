/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { makeWindowTexture } from '../../utils/textures'

const CORRIDOR = 17
const DEPTH = 520

type B = {
  x: number
  z: number
  w: number
  d: number
  h: number
}

function buildLayout(count: number) {
  const rng = mulberry32(1962)
  const list: B[] = []
  for (let i = 0; i < count; i++) {
    const side = rng() > 0.5 ? 1 : -1
    const x = side * (CORRIDOR + rng() * 62)
    const z = -rng() * DEPTH + 20
    const w = 6 + rng() * 14
    const d = 6 + rng() * 14
    const distFromStreet = Math.abs(x) - CORRIDOR
    const h = 26 + rng() * 90 + Math.max(0, 40 - distFromStreet) * 0.8
    list.push({ x, z, w, d, h })
  }
  return list
}

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function City({ count = 190 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const beacons = useRef<THREE.InstancedMesh>(null!)
  const windows = useMemo(() => {
    const t = makeWindowTexture()
    t.repeat.set(2, 5)
    return t
  }, [])
  const layout = useMemo(() => buildLayout(count), [count])

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    layout.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z)
      dummy.scale.set(b.w, b.h, b.d)
      dummy.rotation.y = 0
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      const tint = 0.055 + Math.random() * 0.05
      color.setRGB(tint * 0.8, tint * 0.85, tint * 1.35)
      mesh.current.setColorAt(i, color)

      dummy.position.set(b.x, b.h + 1.2, b.z)
      dummy.scale.setScalar(0.8 + Math.random())
      dummy.updateMatrix()
      beacons.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    beacons.current.instanceMatrix.needsUpdate = true
  }, [layout])

  const beaconMat = useRef<THREE.MeshBasicMaterial>(null!)
  useFrame(({ clock }) => {
    if (beaconMat.current) {
      const t = clock.elapsedTime
      beaconMat.current.opacity = 0.35 + Math.abs(Math.sin(t * 1.9)) * 0.65
    }
  })

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined as any, undefined as any, count]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0b0e1a"
          roughness={0.72}
          metalness={0.35}
          emissive="#ffffff"
          emissiveMap={windows}
          emissiveIntensity={1.35}
        />
      </instancedMesh>

      <instancedMesh ref={beacons} args={[undefined as any, undefined as any, count]}>
        <sphereGeometry args={[0.35, 6, 6]} />
        <meshBasicMaterial ref={beaconMat} color="#ff2d3f" transparent opacity={0.8} />
      </instancedMesh>

      {/* street plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -DEPTH / 2 + 20]}>
        <planeGeometry args={[260, DEPTH + 120]} />
        <meshStandardMaterial color="#05060c" roughness={0.35} metalness={0.7} />
      </mesh>
    </group>
  )
}
