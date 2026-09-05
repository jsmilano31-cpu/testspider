"use client";

import { useState } from "react";
import { ArrowDown, AudioLines, MapPin, Ticket } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Float, PerspectiveCamera, Stars } from "@react-three/drei";

function HeroFigure() {
  return <Float speed={1.5} rotationIntensity={0.12} floatIntensity={0.35}><group position={[0, -0.35, 0]} rotation={[0, 0.2, 0]}>
    <mesh position={[0, 1.35, 0]}><sphereGeometry args={[0.38, 32, 32]} /><meshStandardMaterial color="#d9232e" roughness={0.55} /></mesh>
    <mesh position={[0, 0.45, 0]} scale={[0.8, 1.2, 0.52]}><capsuleGeometry args={[0.62, 1.1, 8, 24]} /><meshStandardMaterial color="#b8192a" roughness={0.7} /></mesh>
    <mesh position={[0, 0.58, 0.43]} scale={[0.48, 0.7, 0.08]}><planeGeometry args={[1, 1.5]} /><meshStandardMaterial color="#151b31" roughness={0.9} /></mesh>
    <mesh position={[-0.55, 0.25, 0]} rotation={[0, 0, -0.4]} scale={[0.28, 1, 0.28]}><capsuleGeometry args={[0.4, 1.2, 8, 16]} /><meshStandardMaterial color="#17213e" roughness={0.75} /></mesh>
    <mesh position={[0.55, 0.25, 0]} rotation={[0, 0, 0.4]} scale={[0.28, 1, 0.28]}><capsuleGeometry args={[0.4, 1.2, 8, 16]} /><meshStandardMaterial color="#17213e" roughness={0.75} /></mesh>
    <pointLight color="#e63e49" intensity={7} distance={4} position={[0, 0.5, 1]} />
  </group></Float>;
}

function Scene() {
  return <Canvas dpr={[1, 1.7]} gl={{ antialias: true }}><PerspectiveCamera makeDefault position={[0, 0.4, 5.2]} fov={42} /><color attach="background" args={["#090b14"]} /><ambientLight intensity={1.4} /><directionalLight position={[-3, 5, 4]} color="#f8d7c4" intensity={3} /><directionalLight position={[4, 2, 1]} color="#496dc5" intensity={4} /><Stars radius={40} depth={20} count={900} factor={2} saturation={0.2} fade speed={0.3} /><HeroFigure /></Canvas>;
}

export default function Home() {
  const [soundOn, setSoundOn] = useState(false);
  return <main className="ad-shell">
    <section className="hero" id="ad-viewport"><div className="scene-layer" aria-hidden="true"><Scene /></div><div className="web-lines" aria-hidden="true" />
      <nav className="topbar"><div className="brand"><span>MARVEL</span><strong>SPIDER-MAN</strong></div><div className="location"><MapPin size={14} /> NEW YORK / 2099</div><button className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={() => setSoundOn(!soundOn)} aria-label="Toggle sound"><AudioLines size={17} /> {soundOn ? "SOUND ON" : "SOUND OFF"}</button></nav>
      <div className="hero-copy"><p className="eyebrow">A new dimension is waiting</p><h1>Across<br /><em>Every</em><br />Dimension</h1><p className="dek">One hero. Infinite worlds. The next chapter swings into theaters.</p><div className="actions"><a className="ticket-button" href="#tickets"><Ticket size={18} /> Get Tickets</a><a className="scroll-cue" href="#chapters"><ArrowDown size={18} /> Explore the web</a></div></div>
      <div className="issue-mark">ISSUE<br /><strong>001</strong></div><div className="frame-corner top-left" /><div className="frame-corner bottom-right" />
    </section>
    <section className="chapter-band" id="chapters"><p className="eyebrow">The web is bigger than one world</p><h2>Every thread leads<br />somewhere <em>new.</em></h2><p>Follow the signal through New York, across the multiverse, and into the story waiting on the other side.</p></section>
    <section className="ticket-band" id="tickets"><span>IN THEATERS THIS SUMMER</span><a className="ticket-button" href="#tickets"><Ticket size={18} /> Find showtimes</a></section>
  </main>;
}
