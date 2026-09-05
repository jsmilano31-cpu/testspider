/* eslint-disable react-hooks/immutability */
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Sparkles, AdaptiveDpr } from '@react-three/drei'
import City from './City'
import SpiderManModel from './SpiderManModel'
import WebRopePhysics from './WebRopePhysics'
import PostProcessing from './PostProcessing'
import { scrollState, useAdStore } from '../../store/useAdStore'

/* ------------------------------------------------------------------ camera */

type Key = { off: [number, number, number]; look: [number, number, number]; fov: number }

const KEYS: Key[] = [
  { off: [4, 34, 80], look: [0, -12, -55], fov: 62 },
  { off: [4.5, 1.2, 8], look: [0, 0.2, 0], fov: 46 },
  { off: [-9, 6, 20], look: [0, -1.5, -8], fov: 60 },
  { off: [5, -6, 12], look: [0, 2.5, 0], fov: 68 },
  { off: [-3.5, 2, 9.5], look: [0, 0, 0], fov: 50 },
  { off: [0.3, 0.9, 6.2], look: [0, 0.35, 0], fov: 42 },
]

function lerpKey(a: Key, b: Key, t: number, out: { off: THREE.Vector3; look: THREE.Vector3; fov: number }) {
  out.off.set(
    THREE.MathUtils.lerp(a.off[0], b.off[0], t),
    THREE.MathUtils.lerp(a.off[1], b.off[1], t),
    THREE.MathUtils.lerp(a.off[2], b.off[2], t),
  )
  out.look.set(
    THREE.MathUtils.lerp(a.look[0], b.look[0], t),
    THREE.MathUtils.lerp(a.look[1], b.look[1], t),
    THREE.MathUtils.lerp(a.look[2], b.look[2], t),
  )
  out.fov = THREE.MathUtils.lerp(a.fov, b.fov, t)
}

/* -------------------------------------------------------------------- hero */

function HeroRig() {
  const root = useRef<THREE.Group>(null!)
  const model = useRef<THREE.Group>(null!)
  const hand = useRef<THREE.Object3D | null>(null)
  const poseRef = useRef(0)
  const anchor = useRef(new THREE.Vector3(12, 40, -20))
  const rift = useRef<THREE.Group>(null!)
  const glow = useRef<THREE.PointLight>(null!)

  const camTarget = useMemo(() => ({ off: new THREE.Vector3(), look: new THREE.Vector3(), fov: 55 }), [])
  const desiredPos = useMemo(() => new THREE.Vector3(), [])
  const lookPos = useMemo(() => new THREE.Vector3(), [])
  const smoothLook = useMemo(() => new THREE.Vector3(0, 12, -40), [])
  const { camera } = useThree()

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const p = scrollState.progress
    const d = Math.min(delta, 1 / 30)

    // --- hero transform along the swing path -------------------------------
    const ph = t * 1.15
    const z = THREE.MathUtils.lerp(-14, -330, p)
    const swingX = Math.sin(ph) * 8.5
    const swingY = 20 + Math.cos(ph * 2) * 5.2 - p * 4
    const pose = THREE.MathUtils.smoothstep(p, 0.84, 0.95)
    poseRef.current = pose

    const px = THREE.MathUtils.lerp(swingX, 0, pose)
    const py = THREE.MathUtils.lerp(swingY, 15.5 + Math.sin(t * 1.1) * 0.35, pose)
    root.current.position.set(px, py, z)
    root.current.rotation.z = THREE.MathUtils.lerp(-Math.sin(ph) * 0.55, Math.sin(t * 0.8) * 0.04, pose)
    root.current.rotation.y = THREE.MathUtils.lerp(Math.PI + Math.sin(ph) * 0.4, Math.PI * 2, pose)
    root.current.rotation.x = THREE.MathUtils.lerp(0.25 + Math.cos(ph) * 0.2, 0, pose)
    const scale = THREE.MathUtils.lerp(1, 1.18, pose)
    root.current.scale.setScalar(scale)

    // --- web anchor --------------------------------------------------------
    const side = Math.cos(ph) >= 0 ? 1 : -1
    anchor.current.set(px + side * 22, py + 30 - pose * 8, z - 22 + pose * 14)

    if (glow.current) glow.current.intensity = 12 + Math.sin(t * 5) * 3 + scrollState.glitch * 30

    // --- multiverse rift ---------------------------------------------------
    if (rift.current) {
      const vis = THREE.MathUtils.smoothstep(p, 0.5, 0.62) * (1 - THREE.MathUtils.smoothstep(p, 0.8, 0.92))
      rift.current.visible = vis > 0.01
      rift.current.position.set(px * 0.3, py + 6, z - 46)
      rift.current.rotation.z = t * 0.25
      rift.current.scale.setScalar(0.2 + vis * (1.6 + Math.sin(t * 2) * 0.06))
      rift.current.children.forEach((c, i) => {
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial
        if (m) m.opacity = vis * (0.85 - i * 0.18)
        c.rotation.y = t * (0.4 + i * 0.25)
      })
    }

    // --- camera rig --------------------------------------------------------
    const seg = p * (KEYS.length - 1)
    const i = Math.min(KEYS.length - 2, Math.floor(seg))
    const f = THREE.MathUtils.smootherstep(seg - i, 0, 1)
    lerpKey(KEYS[i], KEYS[i + 1], f, camTarget)

    const parallaxX = scrollState.pointerX * 3.2
    const parallaxY = scrollState.pointerY * 2.0
    desiredPos.set(
      px + camTarget.off.x + parallaxX,
      py + camTarget.off.y + parallaxY,
      z + camTarget.off.z,
    )
    camera.position.lerp(desiredPos, 1 - Math.pow(0.0009, d))
    lookPos.set(px + camTarget.look.x, py + camTarget.look.y, z + camTarget.look.z)
    smoothLook.lerp(lookPos, 1 - Math.pow(0.0015, d))
    camera.lookAt(smoothLook)
    const cam = camera as THREE.PerspectiveCamera
    const shake = scrollState.glitch * 0.5
    cam.position.x += (Math.random() - 0.5) * shake
    cam.position.y += (Math.random() - 0.5) * shake
    cam.fov += (camTarget.fov - cam.fov) * (1 - Math.pow(0.02, d))
    cam.updateProjectionMatrix()
  })

  return (
    <group>
      <group ref={root}>
        <SpiderManModel ref={model} handRef={hand} poseRef={poseRef} />
        <pointLight ref={glow} color="#ff2b3d" distance={26} intensity={14} position={[0, 0.4, 0.6]} />
      </group>

      <WebRopePhysics handRef={hand} anchorRef={anchor} />

      {/* multiverse rift rings */}
      <group ref={rift}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.4, i * 0.6, 0]}>
            <torusGeometry args={[6 - i * 1.4, 0.22 + i * 0.05, 8, 64]} />
            <meshBasicMaterial
              color={i === 1 ? '#3ea8ff' : '#ff2b6b'}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[3.2, 24, 20]} />
          <meshBasicMaterial
            color="#7d4bff"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------- scene */

function Scene({ low }: { low: boolean }) {
  return (
    <>
      <color attach="background" args={['#04050c']} />
      <fogExp2 attach="fog" args={['#090c1c', 0.006]} />

      <hemisphereLight args={['#31406f', '#05060c', 0.75]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[40, 80, 30]} intensity={1.4} color="#ff5a4d" />
      <directionalLight position={[-50, 40, -40]} intensity={1.1} color="#4c7bff" />

      <City count={low ? 110 : 200} />
      <HeroRig />

      <Sparkles count={low ? 60 : 160} scale={[120, 90, 320]} position={[0, 40, -150]} size={5} speed={0.35} color="#ffd9a8" opacity={0.7} />
      <Sparkles count={low ? 30 : 90} scale={[60, 40, 120]} position={[0, 18, -60]} size={2.5} speed={0.9} color="#8fd0ff" opacity={0.55} />
    </>
  )
}

export default function SceneContainer({ active = true }: { active?: boolean }) {
  const quality = useAdStore((s) => s.quality)
  const low = quality === 'low'
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, low ? 1.25 : 2]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [30, 40, 60], fov: 55, near: 0.5, far: 800 }}
    >
      <PerspectiveCamera makeDefault position={[30, 40, 60]} fov={55} near={0.5} far={800} />
      <Suspense fallback={null}>
        <Scene low={low} />
      </Suspense>
      <PostProcessing low={low} />
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  )
}
