"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Circuit } from "@/lib/data/types";
import type { CircuitMapData } from "@/content/circuitMaps";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { routeThrough } from "./route";

type CircuitWithMap = Circuit & { map: CircuitMapData };

/**
 * Framed maps are cut to a tight box around the stops, which leaves them floating inside one state with no
 * borders in sight. Zoom out around the stops (the outlines run well past the generated box) so the
 * neighbouring borders give the route a context; untouched maps keep their own box.
 */
function viewFor(map: CircuitMapData) {
  const [, , w0, h0] = map.viewBox.split(" ").map(Number);
  if (!map.framed) return { x: -60, y: -10, w: w0 + 120, h: h0 + 20 }; // side room for the stop labels
  const xs = map.stops.map((s) => s.x), ys = map.stops.map((s) => s.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const w = Math.max((Math.max(...xs) - Math.min(...xs)) * 1.9, (Math.max(...ys) - Math.min(...ys)) * 1.6 / 0.8, 560), h = w * 0.8;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/**
 * Pins at their true spot can sit on top of each other (Pattaya and Coral Island are 10 km apart), so push
 * any pair closer than `gap` apart, and put each label on the side away from its nearest neighbour.
 */
function placePins(stops: CircuitMapData["stops"], gap: number, view: { x: number; w: number }, k: number) {
  const pts = stops.map((s) => ({ ...s }));
  for (let pass = 0; pass < 4; pass++)
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = b.x - a.x || 0.01, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d >= gap) continue;
        const push = (gap - d) / 2 / d;
        a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push;
      }
  return pts.map((p) => {
    const near = pts.filter((q) => q !== p).sort((q, r) => Math.hypot(q.x - p.x, q.y - p.y) - Math.hypot(r.x - p.x, r.y - p.y))[0];
    // ...unless that side runs off the map (label width estimated at ~8px a character).
    const width = (20 + p.name.length * 8) * k;
    const left = !!near && near.x > p.x;
    if (left && p.x - width < view.x) return { ...p, labelLeft: false };
    if (!left && p.x + width > view.x + view.w) return { ...p, labelLeft: true };
    return { ...p, labelLeft: left };
  });
}

/** Signature circuits: tabs swap the country map; outline, route and numbered stops draw in. No scroll pinning. */
export function CircuitExplorer({ circuits }: { circuits: CircuitWithMap[] }) {
  const root = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(circuits[0].id);
  const [hover, setHover] = useState<string | null>(null);
  const seen = useRef(false);
  const c = circuits.find((x) => x.id === activeId)!;
  const v = viewFor(c.map);
  const k = v.w / 500; // keeps pins and labels the same on-screen size at any zoom
  const pins = placePins(c.map.stops, 30 * k, v, k);
  const route = routeThrough(pins);

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
    // First reveal waits until the section scrolls into view; if a fast scroll skips past it, just show the end state.
    ScrollTrigger.create({
      trigger: root.current, start: "top 70%", once: true,
      onEnter: () => { seen.current = true; tl.play(); },
      onLeave: () => { seen.current = true; tl.progress(1); },
    });
  }, { scope: root, dependencies: [activeId], revertOnUpdate: true });

  return (
    <section ref={root} className="overflow-x-clip bg-leaf px-6 py-24 text-cream md:px-16" aria-label="Signature circuits">
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

      <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <svg key={c.id} viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} className="mx-auto max-h-[55svh] w-full overflow-hidden lg:max-h-[70svh]" role="img" aria-label={`Map of the ${c.label} circuit`}>
          {c.map.framed && (
            // Cropped regions would end in a hard rectangle; fade the land out only near the edges.
            <defs>
              <radialGradient id={`cx-fade-g-${c.id}`} r="0.5">
                <stop offset="0.6" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </radialGradient>
              <mask id={`cx-fade-${c.id}`} maskUnits="userSpaceOnUse" x={v.x} y={v.y} width={v.w} height={v.h}>
                <rect x={v.x} y={v.y} width={v.w} height={v.h} fill={`url(#cx-fade-g-${c.id})`} />
              </mask>
            </defs>
          )}
          <g mask={c.map.framed ? `url(#cx-fade-${c.id})` : undefined}>
            <path className="cx-fill" d={c.map.outline} fill="#FFF8F0" fillOpacity="0.1" />
            <path className="cx-outline" d={c.map.outline} fill="none" stroke="#FFF8F0" strokeOpacity="0.55" strokeWidth="1.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </g>
          <path className="cx-route" d={route} fill="none" stroke="#F7C548" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {pins.map((s, i) => (
            <g key={s.slug} className="cx-pin">
              <circle cx={s.x} cy={s.y} r={(hover === s.slug ? 17 : 13) * k} fill={hover === s.slug ? "#F7C548" : "#EC5B8C"} stroke="#2E5E3E" strokeWidth={3 * k} className="transition-all duration-300" />
              <text x={s.x} y={s.y + 4.5 * k} textAnchor="middle" fontSize={13 * k} fontWeight="700" fill="#2A1420">{i + 1}</text>
              <text x={s.labelLeft ? s.x - 20 * k : s.x + 20 * k} y={s.y + 5 * k}
                textAnchor={s.labelLeft ? "end" : "start"} fontSize={14 * k} fontWeight="600" fill="#FFF8F0"
                stroke="#2E5E3E" strokeWidth={4 * k} strokeLinejoin="round" paintOrder="stroke">{s.name}</text>
            </g>
          ))}
        </svg>

        <div>
          <ol className="grid gap-5 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-1">
            {c.map.stops.map((s, i) => (
              <li key={s.slug} className="cx-stop" onMouseEnter={() => setHover(s.slug)} onMouseLeave={() => setHover(null)}>
                <div className="flex items-baseline gap-4 border-b border-cream/15 pb-4">
                  <span className="w-6 shrink-0 font-display text-sm text-yellow">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="font-display text-xl sm:text-2xl">{s.name}</p>
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
