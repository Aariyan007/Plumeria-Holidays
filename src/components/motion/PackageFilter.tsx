"use client";
import { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { HolidayType, HolidayTypeSlug, Package, Region } from "@/lib/data/types";
import { Flip, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { PackageCard } from "@/components/ui/PackageCard";

export function PackageFilter({ packages, types, initialType }:
  { packages: Package[]; types: HolidayType[]; initialType?: HolidayTypeSlug }) {
  const [region, setRegion] = useState<Region | "all">("all");
  const [type, setType] = useState<HolidayTypeSlug | "all">(initialType ?? "all");
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const visible = useMemo(() => packages.filter((p) =>
    (region === "all" || p.region === region) && (type === "all" || p.holidayTypes.includes(type))), [packages, region, type]);

  const change = (fn: () => void) => {
    if (!prefersReducedMotion() && grid.current) flipState.current = Flip.getState(grid.current.children);
    fn();
  };

  useLayoutEffect(() => {
    if (!flipState.current || !grid.current) return;
    Flip.from(flipState.current, {
      targets: grid.current.children, duration: 0.6, ease: "power3.inOut", scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }),
    });
    flipState.current = null;
  }, [visible]);

  // Counts reflect the other filter, so each option shows what you'd actually get.
  const regionCount = (r: Region | "all") => packages.filter((p) =>
    (r === "all" || p.region === r) && (type === "all" || p.holidayTypes.includes(type))).length;
  const typeCount = (t: HolidayTypeSlug) => packages.filter((p) =>
    p.holidayTypes.includes(t) && (region === "all" || p.region === region)).length;
  const filtered = region !== "all" || type !== "all";

  const seg = (active: boolean) =>
    `flex-1 whitespace-nowrap rounded-full px-2 py-2.5 min-[360px]:px-3 text-sm font-semibold transition-colors sm:flex-none sm:px-5 ${active ? "bg-plum text-cream shadow-sm" : "text-ink/70 hover:text-ink"}`;
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-yellow bg-yellow font-semibold text-ink" : "border-ink/15 hover:border-plum"}`;
  const n = (k: number) => <span className="ml-1.5 tabular-nums opacity-60">{k}</span>;

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-ink/10 bg-white/60 p-2 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-full bg-ink/5 p-1" role="group" aria-label="Region">
          {(["all", "domestic", "international"] as const).map((r) => (
            <button key={r} aria-pressed={region === r} className={seg(region === r)} onClick={() => change(() => setRegion(r))}>
              {r === "all" ? "All" : r === "domestic" ? "India" : "International"}{n(regionCount(r))}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 px-1 pb-1 sm:p-0 sm:pr-1" role="group" aria-label="Holiday type">
          <button aria-pressed={type === "all"} className={chip(type === "all")} onClick={() => change(() => setType("all"))}>Any style</button>
          {types.map((t) => (
            <button key={t.slug} aria-pressed={type === t.slug} className={chip(type === t.slug)} onClick={() => change(() => setType(t.slug))}>
              {t.name}{n(typeCount(t.slug))}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm" aria-live="polite">
        <p className="text-ink/70">Showing <strong className="text-ink">{visible.length}</strong> {visible.length === 1 ? "itinerary" : "itineraries"}</p>
        {filtered && (
          <button onClick={() => change(() => { setRegion("all"); setType("all"); })} className="font-semibold text-pink-dark underline underline-offset-4">Clear filters</button>
        )}
      </div>

      <div ref={grid} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {visible.map((p) => <PackageCard key={p.slug} pkg={p} />)}
      </div>
      {visible.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-ink/20 p-10 text-center">
          <p className="font-display text-2xl">Nothing here yet</p>
          <p className="mt-2 text-ink/70">We plan custom trips too. <a href="/contact" className="font-semibold text-pink-dark underline underline-offset-4">Tell us where you&apos;d like to go.</a></p>
        </div>
      )}
    </div>
  );
}
