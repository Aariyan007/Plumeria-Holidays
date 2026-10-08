"use client";
import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "./SmoothScroll";

const PETALS = [0, 72, 144, 216, 288];
// Plumeria petal: broad, slightly asymmetric so the five overlap like a pinwheel.
const PETAL_PATH = "M50 50 C 34 44, 24 18, 42 6 C 58 -4, 74 14, 62 34 C 58 41, 55 46, 50 50 Z";

/** Full-screen loader shown on every full page load: plumeria bloom, counter, then circular reveal. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(() => {
    const done = () => { setGone(true); window.dispatchEvent(new Event("preloader:done")); };
    if (prefersReducedMotion()) return done();

    // Lock scrolling while the loader is up (Lenis scrolls programmatically, so stop it too).
    const html = document.documentElement;
    html.dataset.loading = "1";
    html.style.overflow = "hidden";
    getLenis()?.stop();
    const release = () => { delete html.dataset.loading; html.style.overflow = ""; getLenis()?.start(); };
    const counter = { v: 0 };
    const num = root.current!.querySelector<HTMLElement>(".pl-count")!;
    const split = SplitText.create(".pl-word", { type: "chars", mask: "chars" });

    const tl = gsap.timeline({ onComplete: () => { release(); done(); } });
    tl.set(".pl-flower", { rotate: -40, scale: 0.6 })
      .to(counter, { v: 100, duration: 2.4, ease: "power2.inOut", onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0)
      .to(".pl-bar", { scaleX: 1, duration: 2.4, ease: "power2.inOut" }, 0)
      .from(".pl-petal", { scale: 0, rotate: -120, opacity: 0, svgOrigin: "50 50", duration: 1.1, ease: "back.out(1.4)", stagger: 0.14 }, 0.1)
      .to(".pl-flower", { rotate: 0, scale: 1, duration: 2.2, ease: "power3.out" }, 0)
      .from(".pl-core", { scale: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(3)" }, 0.8)
      .from(split.chars, { yPercent: 110, duration: 0.8, ease: "expo.out", stagger: 0.04 }, 0.6)
      .from(".pl-sub", { autoAlpha: 0, y: 10, duration: 0.6 }, 1.2)
      // exit: petals scatter outward, then the overlay closes to a point
      .to(".pl-petal", {
        x: (i) => Math.sin((PETALS[i] * Math.PI) / 180) * 260,
        y: (i) => -Math.cos((PETALS[i] * Math.PI) / 180) * 260,
        rotate: "+=90", opacity: 0, duration: 0.9, ease: "power3.in", stagger: 0.03,
      }, 2.6)
      .to([".pl-text", ".pl-meta"], { autoAlpha: 0, y: -20, duration: 0.5 }, 2.6)
      .to(".pl-core", { scale: 3, opacity: 0, duration: 0.6 }, 2.9)
      .fromTo(root.current, { clipPath: "circle(150% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)", duration: 1, ease: "expo.inOut" }, 3.0);

    // Safety: never block the page for more than 6s.
    const t = setTimeout(() => tl.progress(1), 6000);
    return () => { clearTimeout(t); split.revert(); release(); };
  }, { scope: root });

  if (gone) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[150] flex flex-col items-center justify-center overflow-hidden bg-plum text-cream motion-reduce:hidden" aria-hidden>
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_50%_45%,#EC5B8C55,transparent_70%)]" />
      <svg viewBox="-10 -10 120 120" className="pl-flower relative h-40 w-40 md:h-56 md:w-56">
        <defs>
          <linearGradient id="pl-grad" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#F7C548" />
            <stop offset="35%" stopColor="#FFF3E4" />
            <stop offset="100%" stopColor="#EC5B8C" />
          </linearGradient>
        </defs>
        {PETALS.map((r) => (
          <g key={r} transform={`rotate(${r} 50 50)`}>
            <path className="pl-petal" d={PETAL_PATH} fill="url(#pl-grad)" stroke="#A8255A" strokeOpacity="0.35" strokeWidth="0.6" />
          </g>
        ))}
        <circle className="pl-core" cx="50" cy="50" r="5" fill="#F7C548" />
      </svg>
      <div className="pl-text relative mt-8 text-center">
        <p className="pl-word font-display text-5xl tracking-tight md:text-7xl">Plumeria</p>
        <p className="pl-sub mt-2 text-xs uppercase tracking-[0.6em] text-yellow">Holidays · Kerala</p>
      </div>
      <div className="pl-meta absolute bottom-8 left-6 right-6 flex items-end justify-between md:left-12 md:right-12">
        <p className="max-w-[12rem] text-xs uppercase tracking-[0.3em] text-cream/60">Journeys crafted in God&apos;s Own Country</p>
        <p className="pl-count font-display text-6xl tabular-nums text-yellow md:text-8xl">000</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-cream/10">
        <div className="pl-bar h-full origin-left scale-x-0 bg-gradient-to-r from-yellow to-pink" />
      </div>
    </div>
  );
}
