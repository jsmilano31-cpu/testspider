import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS, scrollState, useAdStore } from '../store/useAdStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * GSAP ScrollTrigger pipeline. The trigger writes into a mutable, non-reactive
 * store (`scrollState`) consumed by the WebGL frame loop, and only pushes the
 * coarse "chapter" index into zustand so the DOM overlay re-renders rarely.
 */
export function useAnimationTimeline(viewportId = 'ad-viewport') {
  const setChapter = useAdStore((s) => s.setChapter)
  const triggerSpiderSense = useAdStore((s) => s.triggerSpiderSense)

  useEffect(() => {
    const el = document.getElementById(viewportId)
    if (!el) return
    let lastChapter = -1

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        scrollState.progress = self.progress
        scrollState.velocity = self.getVelocity()
        const raw = self.progress * CHAPTERS.length
        const idx = Math.min(CHAPTERS.length - 1, Math.floor(raw))
        scrollState.chapterProgress = raw - idx
        if (idx !== lastChapter) {
          lastChapter = idx
          setChapter(idx)
          if (idx === 1 || idx === 3) triggerSpiderSense()
        }
      },
    })

    const onPointer = (e: PointerEvent) => {
      scrollState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      scrollState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointer)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      st.kill()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
    }
  }, [viewportId, setChapter, triggerSpiderSense])
}
