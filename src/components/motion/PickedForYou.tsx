"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { DestinationCard } from "@/components/ui/DestinationCard";

type Picks = { title: string; items: { slug: string; name: string; tagline: string; image: string; days?: number }[] };

const GRID = "grid auto-rows-[13rem] grid-cols-2 gap-3 sm:auto-rows-[16rem] sm:gap-4 lg:grid-cols-3";

/**
 * "Picked for you": destinations chosen by where the visitor is browsing from (see lib/recommend.ts). The page itself
 * stays static; picks load after hydration, behind same-size placeholders so nothing jumps. Add ?geo=AE (or IN-KL)
 * to the URL to preview another location. Hidden if the request fails.
 */
export function PickedForYou() {
  const root = useRef<HTMLElement>(null);
  const [picks, setPicks] = useState<Picks | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const geo = new URLSearchParams(window.location.search).get("geo");
    const ctrl = new AbortController();
    fetch(`/api/recommendations${geo ? `?geo=${encodeURIComponent(geo)}` : ""}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setPicks)
      .catch((e) => { if (e.name !== "AbortError") setFailed(true); });
    return () => ctrl.abort();
  }, []);

  useGSAP(() => {
    if (!picks || prefersReducedMotion()) return;
    gsap.from(".pfy-card", { y: 30, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 });
  }, { scope: root, dependencies: [picks] });

  if (failed) return null;
  return (
    <section ref={root} className="px-6 py-24 md:px-16" aria-labelledby="pfy-title" aria-busy={!picks}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-dark">Picked for you</p>
      <h2 id="pfy-title" className="mt-3 min-h-[1.1em] max-w-3xl font-display text-[clamp(1.875rem,8vw,2.5rem)] leading-[1.05] md:text-5xl">
        {picks?.title ?? <span className="inline-block h-[0.9em] w-2/3 animate-pulse rounded-xl bg-ink/10 align-middle" />}
      </h2>
      <div className={`mt-10 ${GRID}`}>
        {picks
          ? picks.items.map((d) => (
            <div key={d.slug} className="pfy-card flex min-w-0 [&>a]:flex-1"><DestinationCard d={d} days={d.days} /></div>
          ))
          : Array.from({ length: 6 }, (_, i) => <div key={i} className="animate-pulse rounded-3xl bg-ink/10" />)}
      </div>
    </section>
  );
}
