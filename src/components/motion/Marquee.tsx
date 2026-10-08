"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const loop = gsap.to(".mq-track", { xPercent: -50, ease: "none", duration: 30, repeat: -1 });
    // Speed up briefly while the user scrolls.
    const onWheel = () => {
      gsap.to(loop, { timeScale: 3, duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1, delay: 0.2 });
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, { scope: ref });
  const row = (k: string) => items.map((i) => <span key={k + i} className="mx-8">{i} <span className="text-coral">✿</span></span>);
  return (
    <div ref={ref} className="overflow-hidden whitespace-nowrap border-y border-ink/10 py-6 font-display text-4xl md:text-6xl" aria-hidden>
      <div className="mq-track inline-flex">{row("a")}{row("b")}</div>
    </div>
  );
}
