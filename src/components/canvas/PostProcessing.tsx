/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
  Scanline,
  Glitch,
} from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import { scrollState } from '../../store/useAdStore'

export default function PostProcessing({ low = false }: { low?: boolean }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0012, 0.0012), [])
  const glitchDelay = useMemo(() => new THREE.Vector2(1.6, 4.2), [])
  const glitchDuration = useMemo(() => new THREE.Vector2(0.12, 0.34), [])
  const glitchStrength = useMemo(() => new THREE.Vector2(0.18, 0.5), [])
  const bloomRef = useRef<any>(null)
  const caRef = useRef<any>(null)
  const [glitchActive, setGlitchActive] = useState(false)
  const activeRef = useRef(false)

  useFrame((_, delta) => {
    scrollState.glitch = THREE.MathUtils.damp(scrollState.glitch, 0, 2.2, delta)
    const p = scrollState.progress
    const anomaly = THREE.MathUtils.smoothstep(p, 0.55, 0.68) * (1 - THREE.MathUtils.smoothstep(p, 0.78, 0.88))
    const amt = Math.min(1, anomaly + scrollState.glitch)
    caOffset.set(0.0008 + amt * 0.006, 0.0008 + amt * 0.004)
    if (caRef.current?.offset) caRef.current.offset.copy(caOffset)
    const next = amt > 0.12
    if (next !== activeRef.current) {
      activeRef.current = next
      setGlitchActive(next)
    }
    if (bloomRef.current) bloomRef.current.intensity = 0.85 + amt * 1.4
  })

  return (
    <EffectComposer multisampling={low ? 0 : 2} enableNormalPass={false}>
      <Bloom ref={bloomRef} intensity={1.0} luminanceThreshold={0.28} luminanceSmoothing={0.5} mipmapBlur radius={0.75} />
      <ChromaticAberration ref={caRef} offset={caOffset} radialModulation={false} modulationOffset={0} />
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.35} opacity={low ? 0.04 : 0.09} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      <Vignette eskil={false} offset={0.22} darkness={0.95} />
      <Glitch
        delay={glitchDelay}
        duration={glitchDuration}
        strength={glitchStrength}
        mode={GlitchMode.SPORADIC}
        active={glitchActive}
        ratio={0.82}
      />
    </EffectComposer>
  )
}
