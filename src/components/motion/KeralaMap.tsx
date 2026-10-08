"use client";
import Link from "next/link";
import { useRef } from "react";
import type { Destination } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { KERALA_OUTLINE, routeThrough } from "./keralaPath";

export function KeralaMap({ stops }: { stops: Destination[] }) {
  const root = useRef<HTMLElement>(null);
  const route = routeThrough(stops.map((s) => s.map!));

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const n = stops.length;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root.current, start: "top top", end: `+=${n * 60}%`, pin: true, scrub: 0.6 },
    });
    tl.from(".km-outline", { drawSVG: 0, duration: 1, ease: "none" })
      .from(".km-route", { drawSVG: 0, duration: n, ease: "none" }, 0.5);
    stops.forEach((_, i) => {
      const at = 0.5 + (i / Math.max(n - 1, 1)) * n;
      tl.from(`[data-pin="${i}"]`, { scale: 0, transformOrigin: "center", duration: 0.3, ease: "back.out(3)" }, at - 0.15)
        .from(`[data-stop="${i}"]`, { x: 30, autoAlpha: 0, duration: 0.3 }, at - 0.15);
    });
  }, { scope: root });

  return (
    <section ref={root} className="grid min-h-svh items-center gap-10 bg-leaf px-6 py-24 text-cream md:grid-cols-2 md:px-16" aria-label="Kerala route map">
      <svg viewBox="0 0 400 800" className="mx-auto h-[60svh] w-auto md:h-[75svh]" role="img" aria-label="Map of Kerala with our classic route">
        <path className="km-outline" d={KERALA_OUTLINE} fill="#FFF8F0" fillOpacity="0.06" stroke="#FFF8F0" strokeOpacity="0.6" strokeWidth="2" />
        <path className="km-route" d={route} fill="none" stroke="#F7C548" strokeWidth="3" strokeLinecap="round" />
        {stops.map((s, i) => (
          <g key={s.slug} data-pin={i}>
            <circle cx={s.map!.x} cy={s.map!.y} r="16" fill="none" stroke="#EC5B8C" strokeOpacity="0.6" />
            <circle cx={s.map!.x} cy={s.map!.y} r="8" fill="#EC5B8C" />
            <text x={s.map!.x + 22} y={s.map!.y + 6} fill="#FFF8F0" fontSize="20" style={{ fontFamily: "var(--font-display)" }}>{s.name}</text>
          </g>
        ))}
      </svg>
      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-yellow">The Kerala circuit</p>
        <h2 className="font-display text-4xl md:text-6xl">From the hills to the sea, in one journey</h2>
        <ol className="mt-10 space-y-4">
          {stops.map((s, i) => (
            <li key={s.slug} data-stop={i}>
              <Link href={`/destinations/${s.slug}`} className="group flex flex-wrap items-baseline gap-x-4" data-cursor>
                <span className="text-sm text-yellow">0{i + 1}</span>
                <span className="font-display text-2xl group-hover:text-yellow">{s.name}</span>
                <span className="text-sm text-cream/75">{s.tagline}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
