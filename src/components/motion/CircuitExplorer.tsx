"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Circuit } from "@/lib/data/types";
import type { CircuitMapData } from "@/content/circuitMaps";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { routeThrough } from "./route";

type CircuitWithMap = Circuit & { map: CircuitMapData };

/** Signature circuits: tabs swap the country map; outline, route and numbered stops draw in. No scroll pinning. */
export function CircuitExplorer({ circuits }: { circuits: CircuitWithMap[] }) {
  const root = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(circuits[0].id);
  const [hover, setHover] = useState<string | null>(null);
  const seen = useRef(false);
  const c = circuits.find((x) => x.id === activeId)!;
  const route = routeThrough(c.map.stops);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline({ paused: true })
      .from(".cx-outline", { drawSVG: 0, duration: 1.2, ease: "power2.inOut" })
      .from(".cx-fill", { opacity: 0, duration: 0.8 }, 0.6)
      .from(".cx-route", { drawSVG: 0, duration: 1.6, ease: "power1.inOut" }, 0.7)
      .from(".cx-pin", { scale: 0, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(3)", stagger: 1.6 / c.map.stops.length }, 0.75)
      .from(".cx-title", { y: 30, autoAlpha: 0, duration: 0.6, ease: "expo.out" }, 0)
      .from(".cx-stop", { x: 30, autoAlpha: 0, duration: 0.5, ease: "expo.out", stagger: 0.08 }, 0.2);
    if (seen.current) { tl.play(); return; }
    // First reveal waits until the section scrolls into view.
    ScrollTrigger.create({ trigger: root.current, start: "top 70%", once: true, onEnter: () => { seen.current = true; tl.play(); } });
  }, { scope: root, dependencies: [activeId], revertOnUpdate: true });

  return (
    <section ref={root} className="bg-leaf px-6 py-24 text-cream md:px-16" aria-label="Signature circuits">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-yellow">Signature circuits</p>
          <h2 className="cx-title max-w-2xl font-display text-4xl md:text-6xl">{c.title}</h2>
        </div>
        <div role="tablist" aria-label="Choose a circuit" className="flex flex-wrap gap-2">
          {circuits.map((x) => (
            <button key={x.id} role="tab" aria-selected={x.id === activeId} onClick={() => setActiveId(x.id)}
              className={`rounded-full border px-5 py-2 text-sm transition-colors ${x.id === activeId ? "border-yellow bg-yellow text-ink" : "border-cream/30 hover:border-cream"}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-14 grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        <svg key={c.id} viewBox={c.map.viewBox} className="mx-auto max-h-[70svh] w-full" role="img" aria-label={`Map of the ${c.label} circuit`}>
          <path className="cx-fill" d={c.map.outline} fill="#FFF8F0" fillOpacity="0.07" />
          <path className="cx-outline" d={c.map.outline} fill="none" stroke="#FFF8F0" strokeOpacity="0.7" strokeWidth="1.2" strokeLinejoin="round" />
          <path className="cx-route" d={route} fill="none" stroke="#F7C548" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 0" />
          {c.map.stops.map((s, i) => (
            <g key={s.slug} className="cx-pin">
              <circle cx={s.x} cy={s.y} r={hover === s.slug ? 20 : 15} fill={hover === s.slug ? "#F7C548" : "#EC5B8C"} className="transition-all duration-300" />
              <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#2A1420">{i + 1}</text>
            </g>
          ))}
        </svg>

        <div>
          <ol className="space-y-5">
            {c.map.stops.map((s, i) => (
              <li key={s.slug} className="cx-stop" onMouseEnter={() => setHover(s.slug)} onMouseLeave={() => setHover(null)}>
                <div className="flex items-baseline gap-4 border-b border-cream/15 pb-4">
                  <span className="font-display text-sm text-yellow">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-2xl">{s.name}</p>
                    <p className="text-sm text-cream/75">{c.notes[s.slug]}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <Link href={`/packages/${c.packageSlug}`} className="cx-stop mt-8 inline-flex rounded-full bg-yellow px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-cream">
            See the {c.label} itinerary
          </Link>
        </div>
      </div>
    </section>
  );
}
