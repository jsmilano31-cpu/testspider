/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { makeSuitTexture } from '../../utils/textures'

type Props = {
  handRef?: React.MutableRefObject<THREE.Object3D | null>
  /** 0 = swing loop, 1 = crouched hero landing pose */
  poseRef?: React.MutableRefObject<number>
}

/**
 * Fully procedural, Draco-free hero mesh. Built from capsule/sphere primitives so the
 * character ships inside the JS bundle with zero network payload.
 */
const SpiderManModel = forwardRef<THREE.Group, Props>(function SpiderManModel({ handRef, poseRef }, ref) {
  const redMap = useMemo(() => makeSuitTexture('#d1112c', '#0a0a12'), [])
  const blueMap = useMemo(() => makeSuitTexture('#182c74', '#05060f'), [])

  const red = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: redMap,
        color: '#ff2b3d',
        roughness: 0.45,
        metalness: 0.15,
        emissive: new THREE.Color('#3a0008'),
        emissiveIntensity: 0.6,
      }),
    [redMap],
  )
  const blue = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: blueMap,
        color: '#3455c8',
        roughness: 0.5,
        metalness: 0.2,
        emissive: new THREE.Color('#001033'),
        emissiveIntensity: 0.8,
      }),
    [blueMap],
  )
  const eye = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: new THREE.Color('#dff3ff'),
        emissiveIntensity: 3.2,
        roughness: 0.1,
      }),
    [],
  )

  const shoulderL = useRef<THREE.Group>(null!)
  const shoulderR = useRef<THREE.Group>(null!)
  const elbowL = useRef<THREE.Group>(null!)
  const elbowR = useRef<THREE.Group>(null!)
  const hipL = useRef<THREE.Group>(null!)
  const hipR = useRef<THREE.Group>(null!)
  const kneeL = useRef<THREE.Group>(null!)
  const kneeR = useRef<THREE.Group>(null!)
  const spine = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pose = poseRef?.current ?? 0
    const s = Math.sin(t * 1.6)
    const s2 = Math.sin(t * 1.6 + 1.1)

    const mix = (a: number, b: number) => a * (1 - pose) + b * pose

    // right arm reaches for the web anchor, left trails
    shoulderR.current.rotation.z = mix(-2.35 + s * 0.12, -0.55)
    shoulderR.current.rotation.x = mix(-0.25 + s2 * 0.1, -0.3)
    elbowR.current.rotation.z = mix(-0.18, -0.75)

    shoulderL.current.rotation.z = mix(1.35 + s * 0.2, 0.7)
    shoulderL.current.rotation.x = mix(0.35 - s2 * 0.25, 0.5)
    elbowL.current.rotation.z = mix(0.55, 1.15)

    hipL.current.rotation.x = mix(-0.85 + s * 0.35, 1.15)
    hipR.current.rotation.x = mix(-0.35 - s * 0.4, 0.55)
    kneeL.current.rotation.x = mix(0.95 + s2 * 0.25, 1.6)
    kneeR.current.rotation.x = mix(0.6 - s2 * 0.3, 0.4)
    hipL.current.rotation.z = mix(0.12, 0.35)
    hipR.current.rotation.z = mix(-0.12, -0.35)

    spine.current.rotation.x = mix(0.42 + s * 0.06, 0.75)
    head.current.rotation.x = mix(-0.5 - s * 0.05, -0.55)
    head.current.rotation.y = mix(s2 * 0.12, 0.1)
  })

  return (
    <group ref={ref} dispose={null}>
      <group ref={spine}>
        {/* torso */}
        <mesh material={red} position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.34, 0.62, 6, 16]} />
        </mesh>
        {/* pelvis */}
        <mesh material={blue} position={[0, -0.36, 0]}>
          <capsuleGeometry args={[0.3, 0.18, 6, 14]} />
        </mesh>

        {/* head */}
        <group ref={head} position={[0, 0.72, 0]}>
          <mesh material={red}>
            <sphereGeometry args={[0.27, 20, 18]} />
          </mesh>
          <mesh material={eye} position={[0.13, 0.03, 0.2]} rotation={[0, 0.35, 0.35]} scale={[1, 0.62, 0.4]}>
            <sphereGeometry args={[0.115, 14, 12]} />
          </mesh>
          <mesh material={eye} position={[-0.13, 0.03, 0.2]} rotation={[0, -0.35, -0.35]} scale={[1, 0.62, 0.4]}>
            <sphereGeometry args={[0.115, 14, 12]} />
          </mesh>
        </group>

        {/* right arm */}
        <group ref={shoulderR} position={[0.36, 0.42, 0]}>
          <mesh material={red} position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.11, 0.38, 5, 12]} />
          </mesh>
          <group ref={elbowR} position={[0.56, 0, 0]}>
            <mesh material={red} position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.09, 0.34, 5, 12]} />
            </mesh>
            <group ref={handRef as any} position={[0.5, 0, 0]}>
              <mesh material={red}>
                <sphereGeometry args={[0.1, 12, 10]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* left arm */}
        <group ref={shoulderL} position={[-0.36, 0.42, 0]}>
          <mesh material={red} position={[-0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.11, 0.38, 5, 12]} />
          </mesh>
          <group ref={elbowL} position={[-0.56, 0, 0]}>
            <mesh material={red} position={[-0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.09, 0.34, 5, 12]} />
            </mesh>
            <mesh material={red} position={[-0.5, 0, 0]}>
              <sphereGeometry args={[0.1, 12, 10]} />
            </mesh>
          </group>
        </group>

        {/* legs */}
        <group ref={hipR} position={[0.17, -0.5, 0]}>
          <mesh material={blue} position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.12, 0.4, 5, 12]} />
          </mesh>
          <group ref={kneeR} position={[0, -0.58, 0]}>
            <mesh material={blue} position={[0, -0.26, 0]}>
              <capsuleGeometry args={[0.1, 0.38, 5, 12]} />
            </mesh>
            <mesh material={red} position={[0, -0.52, 0.05]} scale={[1, 0.7, 1.5]}>
              <sphereGeometry args={[0.11, 10, 10]} />
            </mesh>
          </group>
        </group>
        <group ref={hipL} position={[-0.17, -0.5, 0]}>
          <mesh material={blue} position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.12, 0.4, 5, 12]} />
          </mesh>
          <group ref={kneeL} position={[0, -0.58, 0]}>
            <mesh material={blue} position={[0, -0.26, 0]}>
              <capsuleGeometry args={[0.1, 0.38, 5, 12]} />
            </mesh>
            <mesh material={red} position={[0, -0.52, 0.05]} scale={[1, 0.7, 1.5]}>
              <sphereGeometry args={[0.11, 10, 10]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
})

export default SpiderManModel
