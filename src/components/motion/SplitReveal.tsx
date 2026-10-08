"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p";
export function SplitReveal({ as = "h2", className, children, immediate = false }:
  { as?: Tag; className?: string; children: string; immediate?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Comp = as;
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const split = SplitText.create(ref.current!, {
      type: "lines,words", mask: "lines", autoSplit: true,
      onSplit: (self) => gsap.from(self.words, {
        yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.04,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 85%" },
      }),
    });
    return () => split.revert();
  }, { scope: ref });
  return <Comp ref={ref} className={className}>{children}</Comp>;
}
