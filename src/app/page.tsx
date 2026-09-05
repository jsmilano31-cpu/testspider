"use client";

import { useEffect, useState } from "react";
import SceneContainer from "@/components/canvas/SceneContainer";
import HUDOverlay from "@/components/ui/HUDOverlay";
import WebShooterLayer from "@/components/ui/WebShooterLayer";
import TicketBookingCTA from "@/components/ui/TicketBookingCTA";
import MarketingSections from "@/components/ui/MarketingSections";
import Preloader from "@/components/ui/Preloader";
import { useAnimationTimeline } from "@/hooks/useAnimationTimeline";
import { useAudioController } from "@/hooks/useAudio";

const VIEWPORT_ID = "ad-viewport";

export default function Home() {
  useAnimationTimeline(VIEWPORT_ID);
  useAudioController();
  const [cinematic, setCinematic] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const element = document.getElementById(VIEWPORT_ID);
      if (!element) return;
      const end = element.offsetTop + element.offsetHeight - window.innerHeight * 0.75;
      setCinematic(window.scrollY < end);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#04050c] text-white antialiased md:cursor-none">
      <div
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${cinematic ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <SceneContainer active={cinematic} />
      </div>

      <div className="pointer-events-none fixed inset-0 z-10 opacity-40 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)]" />

      <div id={VIEWPORT_ID} className="relative z-20 h-[640vh]">
        <div className="sticky top-0 h-screen w-full" />
      </div>

      <div className={`transition-opacity duration-500 ${cinematic ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <HUDOverlay />
      </div>
      <WebShooterLayer />
      <MarketingSections />
      <TicketBookingCTA />
      <Preloader />
    </main>
  );
}
