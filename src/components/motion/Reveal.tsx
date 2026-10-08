"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from(ref.current!.children, {
      y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay,
      scrollTrigger: { trigger: ref.current, start: "top 85%" },
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}
