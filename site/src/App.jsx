import React, { useEffect, useRef, useState } from "react";

function Layer({ className, style }) {
  return <div className={`layer ${className}`} style={style}></div>;
}

// Per-layer parallax travel in px. Bigger = moves more = feels closer.
const LAYERS = [
  { cls: "sky", label: "Sky", travel: 0 },
  { cls: "misty-mountains", label: "Misty Mountain range", travel: 120 },
  { cls: "tree-tops-back", label: "Tree tops (Back)", travel: 220 },
  { cls: "temple", label: "Temple", travel: 660 },
  { cls: "deity", label: "Deity", travel: 900 },
  { cls: "trees-front", label: "Trees (Front)", travel: 550 },
  { cls: "palm-leafsL", label: "Big Palm Leafs L", travel: 920 },
  { cls: "palm-leafsR", label: "Big Palm Leafs R", travel: 920 },
  { cls: "bushes", label: "Bushes (Foreground)", travel: 1020 },
];

const PARALLAX_RANGE = 1000; // px of scroll consumed by the landing animation
const STALL = 100; // px of scroll where everything is pinned

export default function App() {
  const sceneRef = useRef(null);
  const page2Ref = useRef(null);
  const page3Ref = useRef(null);
  const page4Ref = useRef(null);
  const [progress, setProgress] = useState(0); // 0..1
  const [shoreProgress, setShoreProgress] = useState(0); // 0..1
  const [deityProgress, setDeityProgress] = useState(0); // 0..1

  const HEADER_H = 84.76;
  const scrollToEl = (el, offset = 0) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const goPage1Bottom = () => {
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const y = rect.bottom + window.scrollY - window.innerHeight;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const goPage2 = () => scrollToEl(page2Ref.current, -HEADER_H);
  const goBeforeShore = () => {
    const el = page3Ref.current;
    if (!el) return;
    const vh = window.innerHeight;
    // shoreProgress rise begins when (page3.bottom - vh) === vh * 0.7.
    // Stop just before that so the shore is still fully below the viewport.
    const y = el.getBoundingClientRect().bottom + window.scrollY - vh * 1.5;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const goPage4 = () => scrollToEl(page4Ref.current, -HEADER_H);

  useEffect(() => {
    const onScroll = () => {
      const el = sceneRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const y = window.scrollY - top;
        setProgress(Math.max(0, Math.min(1, y / PARALLAX_RANGE)));
      }
      const p3 = page3Ref.current;
      if (p3) {
        const rect = p3.getBoundingClientRect();
        const vh = window.innerHeight;
        // Rocky shore sits at the bottom of the (2756px) page 3. Trigger the
        // rise only when the bottom of page 3 is approaching the viewport bottom
        // so it feels like a rapid last-moment elevation.
        const distance = rect.bottom - vh; // px until page 3 bottom meets viewport bottom
        const RANGE = vh * 0.7; // how much scroll the rise consumes
        const sp = 1 - Math.max(0, Math.min(1, distance / RANGE));
        setShoreProgress(sp);

        // Deity reveal: begins when the deity's position enters the viewport
        // bottom, completes as it reaches roughly the middle of the screen.
        const DEITY_TOP = rect.height * 0.4019; // 40.19% of page-3
        const DEITY_H = rect.height * 0.2297; // 22.97% of page-3
        const waterLine = rect.top + DEITY_TOP + DEITY_H;
        const start = vh; // waterline at bottom of viewport → progress 0
        // Fully revealed exactly at Button 3's scroll target
        // (same offset logic as goBeforeShore: page3.bottom - vh*1.5 from top).
        const end = DEITY_TOP + DEITY_H - (rect.height - vh * 1.5);
        const dp = (start - waterLine) / (start - end);
        setDeityProgress(Math.max(0, Math.min(1, dp)));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site">
      {/* Sticky header */}
      <header className="sticky-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo"></div>
            <div className="title"></div>
          </div>
          <nav className="nav-buttons">
            <button className="btn" onClick={goPage1Bottom}>
              Home
            </button>
            <button className="btn" onClick={goPage2}>
              About Us
            </button>
            <button className="btn" onClick={goBeforeShore}>
              Sponsors
            </button>  
            <button className="btn" onClick={goPage4}>
              FAQ
            </button>
          </nav>
        </div>
      </header>

      {/* Page 1 — Jungle temple (parallax landing + stall) */}
      <div
        ref={sceneRef}
        className="parallax-scene"
        style={{ height: `calc(100vh + ${PARALLAX_RANGE + STALL}px)` }}
      >
        <div className="parallax-viewport page-1">
          {LAYERS.map(({ cls, label, travel }) => (
            <Layer
              key={cls}
              className={cls}
              style={{ transform: `translateY(${(1 - progress) * travel}px)` }}
            >
              {label}
            </Layer>
          ))}
        </div>
      </div>

      {/* Page 2 - Catacombs */}
      <section className="page page-2" ref={page2Ref}>
        <Layer className="cavern-wall"></Layer>
        <Layer className="mural">Mural (gilded edge)</Layer>
      </section>

      {/* Page 3 - Cenote */}
      <section className="page page-3" ref={page3Ref}>
        <Layer className="cenote-bg"></Layer>
        <div className="deity-clip">
          <div
            className="deity-inner"
            style={{ transform: `translateY(${(1 - deityProgress) * 75}%)` }}
          ></div>
        </div>
        <div className="deity-reflection-clip">
          <div
            className="deity-reflection-inner"
            style={{ transform: `translateY(${(1 - deityProgress) * 75}%)` }}
          ></div>
        </div>
        <Layer
          className="rocky-shore"
          style={{
            transform: `translateY(${Math.pow(1 - shoreProgress, 2) * 400}px)`,
          }}
        ></Layer>
      </section>

      {/* Page 4 - solid color landing after rocky shore transition */}
      <section className="page page-4" ref={page4Ref}></section>
    </div>
  );
}
