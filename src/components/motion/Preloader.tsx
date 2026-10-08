"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const KEY = "plumeria-preloaded";

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(() => {
    const done = () => { setGone(true); window.dispatchEvent(new Event("preloader:done")); };
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch {}
    if (seen || prefersReducedMotion()) return done();
    try { sessionStorage.setItem(KEY, "1"); } catch {}

    const tl = gsap.timeline({ onComplete: done });
    tl.from(".pl-petal", { scale: 0, rotate: -90, svgOrigin: "50 50", duration: 1, ease: "back.out(1.6)", stagger: 0.09 })
      .from(".pl-core", { scale: 0, transformOrigin: "50% 50%", duration: 0.4 }, "-=0.4")
      .from(".pl-word", { yPercent: 100, duration: 0.7, ease: "expo.out" }, "-=0.3")
      .to(".pl-flower", { rotate: 72, scale: 14, opacity: 0, duration: 1.1, ease: "expo.in", transformOrigin: "50% 50%" }, "+=0.3")
      .to(root.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.5");
    // Safety: never block more than 4.5s.
    const t = setTimeout(() => tl.progress(1), 4500);
    return () => clearTimeout(t);
  }, { scope: root });

  if (gone) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-teal text-cream motion-reduce:hidden" aria-hidden>
      <svg viewBox="0 0 100 100" className="pl-flower h-28 w-28">
        {[0, 72, 144, 216, 288].map((r) => (
          <g key={r} transform={`rotate(${r} 50 50)`}>
            <path className="pl-petal" d="M50 50 C 38 30, 42 8, 58 6 C 72 6, 68 32, 50 50 Z" fill="#FBF6EC" stroke="#F2766B" strokeWidth="1" />
          </g>
        ))}
        <circle className="pl-core" cx="50" cy="50" r="6" fill="#E8B04B" />
      </svg>
      <div className="mt-6 overflow-hidden"><p className="pl-word font-display text-2xl tracking-wide">Plumeria Holidays</p></div>
    </div>
  );
}
