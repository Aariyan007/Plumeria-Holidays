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

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-teal bg-teal text-cream" : "border-ink/20 hover:border-teal"}`;

  return (
    <div>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Region">
        {(["all", "domestic", "international"] as const).map((r) => (
          <button key={r} aria-pressed={region === r} className={chip(region === r)} onClick={() => change(() => setRegion(r))}>
            {r === "all" ? "All" : r === "domestic" ? "India" : "International"}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Holiday type">
        <button aria-pressed={type === "all"} className={chip(type === "all")} onClick={() => change(() => setType("all"))}>Any type</button>
        {types.map((t) => (
          <button key={t.slug} aria-pressed={type === t.slug} className={chip(type === t.slug)} onClick={() => change(() => setType(t.slug))}>{t.name}</button>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink/70" aria-live="polite">{visible.length} {visible.length === 1 ? "package" : "packages"}</p>
      <div ref={grid} className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => <PackageCard key={p.slug} pkg={p} />)}
      </div>
      {visible.length === 0 && (
        <p className="mt-8 text-lg">No packages match yet. <a href="/contact" className="text-coral-dark underline">Ask us to build one for you.</a></p>
      )}
    </div>
  );
}
