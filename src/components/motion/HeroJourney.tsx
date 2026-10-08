"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import type { HeroScene } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { canUseWebGL, isLowEndDevice, prefersReducedMotion } from "@/lib/motion";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

type Mode = "static" | "fallback" | "webgl";

export function HeroJourney({ scenes }: { scenes: HeroScene[] }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [mode, setMode] = useState<Mode>("static");
  const [petals, setPetals] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mobile = window.innerWidth < 768;
    // Decided client-side after hydration: depends on device capabilities.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(canUseWebGL() && !isLowEndDevice() ? "webgl" : "fallback");
    setPetals(mobile ? 40 : 120);
  }, []);

  useGSAP(() => {
    if (mode === "static") return;
    const n = scenes.length;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current, start: "top top", end: `+=${(n - 1) * 100}%`, pin: true, scrub: 0.6,
        onUpdate: (st) => { progress.current = st.progress * (n - 1); },
      },
    });
    scenes.forEach((_, i) => {
      if (i === 0) return;
      const at = i - 1;
      tl.to(`[data-caption="${i - 1}"]`, { yPercent: -40, autoAlpha: 0, duration: 0.4 }, at + 0.1)
        .fromTo(`[data-caption="${i}"]`, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4 }, at + 0.5);
      if (mode === "fallback") tl.fromTo(`[data-layer="${i}"]`, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 1 }, at);
    });
    tl.fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: n - 1 }, 0);
    const intro = () => gsap.from('[data-caption="0"] > *', { yPercent: 60, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "expo.out" });
    window.addEventListener("preloader:done", intro, { once: true });
    return () => window.removeEventListener("preloader:done", intro);
  }, { scope: root, dependencies: [mode], revertOnUpdate: true });

  const animated = mode !== "static";
  return (
    <section ref={root} className="relative h-svh w-full overflow-hidden bg-teal text-cream" aria-label="Kerala journey">
      {/* Image layers are always in the server HTML; WebGL draws over them once ready. */}
      {scenes.map((s, i) => (
        <div key={s.id} data-layer={i} className={`absolute inset-0 ${i === 0 ? "" : "invisible opacity-0"}`}>
          <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
        </div>
      ))}
      {mode === "webgl" && <HeroCanvas images={scenes.map((s) => s.image)} progress={progress} container={root} petals={petals} />}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-ink/40" />
      <div className="relative z-10 flex h-full items-end px-6 pb-24 md:px-16">
        <div className={`relative w-full max-w-5xl ${animated ? "" : "space-y-8"}`}>
          {scenes.map((s, i) => {
            const Title = i === 0 ? "h1" : "h2";
            return (
              <div key={s.id} data-caption={i} className={animated ? `absolute bottom-0 left-0 ${i === 0 ? "" : "invisible opacity-0"}` : ""}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold">{s.kicker}</p>
                <Title className={`font-display leading-[0.95] ${animated ? "text-5xl md:text-8xl" : i === 0 ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl"}`}>{s.title}</Title>
              </div>
            );
          })}
        </div>
      </div>
      {animated && (
        <div className="absolute bottom-8 left-6 right-6 z-10 h-px bg-cream/30 md:left-16 md:right-16">
          <div data-progress className="h-full origin-left scale-x-0 bg-coral" />
        </div>
      )}
    </section>
  );
}
