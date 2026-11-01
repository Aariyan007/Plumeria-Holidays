"use client";
import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Memory, MemoryTag, Testimonial } from "@/lib/data/types";
import { Flip, gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { Lightbox } from "./Lightbox";

type Cell = { kind: "photo"; m: Memory; i: number } | { kind: "quote"; t: Testimonial };

const SHAPE = { portrait: "aspect-[4/5]", landscape: "aspect-[4/3]", square: "aspect-square" } as const;
/** In the unfiltered wall, a traveller quote follows these photo positions. */
const QUOTE_AFTER = [1, 4];

/** Masonry wall of trip photos with tag filters, traveller quotes between photos, and a full-screen viewer. */
export function MemoryGallery({ memories, tags, quotes }:
  { memories: Memory[]; tags: { slug: MemoryTag; label: string }[]; quotes: Testimonial[] }) {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [tag, setTag] = useState<MemoryTag | "all">("all");
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(() => memories.filter((m) => tag === "all" || m.tag === tag), [memories, tag]);
  const cells = useMemo(() => {
    const out: Cell[] = [];
    visible.forEach((m, i) => {
      out.push({ kind: "photo", m, i });
      const q = QUOTE_AFTER.indexOf(i);
      if (tag === "all" && q !== -1 && quotes[q]) out.push({ kind: "quote", t: quotes[q] });
    });
    return out;
  }, [visible, tag, quotes]);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray<HTMLElement>(".mg-cell").forEach((el) =>
      gsap.from(el, { y: 60, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
  }, { scope: root });

  const pick = (t: MemoryTag | "all") => {
    if (t === tag) return;
    if (!prefersReducedMotion() && grid.current) flipState.current = Flip.getState(grid.current.children);
    setTag(t);
  };

  useLayoutEffect(() => {
    if (!flipState.current || !grid.current) return;
    Flip.from(flipState.current, {
      targets: grid.current.children, duration: 0.6, ease: "power3.inOut",
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.5 }),
    });
    flipState.current = null;
  }, [cells]);

  const close = useCallback(() => setOpen(null), []);
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-plum bg-plum text-cream" : "border-fg/20 hover:border-heading"}`;

  return (
    <div ref={root}>
      <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Filter photos">
        <button aria-pressed={tag === "all"} className={chip(tag === "all")} onClick={() => pick("all")}>All moments</button>
        {tags.map((t) => (
          <button key={t.slug} aria-pressed={tag === t.slug} className={chip(tag === t.slug)} onClick={() => pick(t.slug)}>{t.label}</button>
        ))}
      </div>

      <div ref={grid} className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 lg:gap-6">
        {cells.map((c) => c.kind === "photo" ? (
          <figure key={c.m.image} className="mg-cell mb-5 break-inside-avoid lg:mb-6">
            <button onClick={() => setOpen(c.i)} aria-label={`View photo: ${c.m.caption}`} data-cursor
              className={`group relative block w-full overflow-hidden rounded-3xl text-left ${SHAPE[c.m.shape]}`}>
              <Image src={c.m.image} alt={c.m.caption} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" />
              <span aria-hidden className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-ink transition-all duration-300 pointer-fine:scale-75 pointer-fine:opacity-0 pointer-fine:group-hover:scale-100 pointer-fine:group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </span>
              <figcaption className="absolute inset-x-5 bottom-5 text-cream">
                <span className="inline-block rounded-full bg-cream/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">{c.m.place}</span>
                <span className="mt-2 block font-display text-xl leading-tight md:text-2xl">{c.m.caption}</span>
              </figcaption>
            </button>
          </figure>
        ) : (
          <figure key={c.t.name} className="mg-cell mb-5 break-inside-avoid rounded-3xl bg-plum p-7 text-cream lg:mb-6 md:p-8">
            <span aria-hidden className="block font-display text-7xl leading-[0.6] text-pink">“</span>
            <blockquote className="mt-4 font-display text-xl leading-snug md:text-2xl">{c.t.quote}</blockquote>
            <figcaption className="mt-6 text-sm"><strong>{c.t.name}</strong> <span className="text-cream/70">· {c.t.trip}</span></figcaption>
          </figure>
        ))}
      </div>

      {open !== null && <Lightbox items={visible} index={open} onClose={close} onIndex={setOpen} />}
    </div>
  );
}
