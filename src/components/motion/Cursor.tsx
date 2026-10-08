"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const el = dot.current!;
    el.style.display = "block";
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY);
      const hot = (e.target as HTMLElement).closest?.("a,button,[data-cursor]");
      gsap.to(el, { scale: hot ? 2.6 : 1, duration: 0.3, overwrite: "auto" });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  });
  return (
    <div ref={dot} aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-3 w-3 -ml-1.5 -mt-1.5 rounded-full bg-coral mix-blend-multiply" />
  );
}
