"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 2, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 90%" },
      onUpdate: () => { ref.current!.textContent = `${Math.round(o.v).toLocaleString("en-IN")}${suffix}`; },
    });
  });
  return <span ref={ref}>{to.toLocaleString("en-IN")}{suffix}</span>;
}
