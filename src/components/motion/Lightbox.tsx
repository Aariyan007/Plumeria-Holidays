"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Memory } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "./SmoothScroll";

type Props = { items: Memory[]; index: number; onClose: () => void; onIndex: (i: number) => void };

/** Full-screen photo viewer: arrow keys / swipe to move, Esc to close, focus kept inside while open. */
export function Lightbox({ items, index, onClose, onIndex }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const swipeX = useRef<number | null>(null);
  const m = items[index];
  const go = (d: number) => onIndex((index + d + items.length) % items.length);

  // Lock page scroll, wire keys, and hand focus back to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    closeBtn.current?.focus();
    return () => { html.style.overflow = ""; getLenis()?.start(); opener?.focus(); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
      else if (e.key === "Tab") {
        const f = [...root.current!.querySelectorAll<HTMLElement>("button")];
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    // opacity, not autoAlpha: visibility:hidden would stop the close button taking focus on open.
    gsap.from(root.current, { opacity: 0, duration: 0.35, ease: "power2.out" });
  }, { scope: root });

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(".lb-photo", { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" });
  }, { scope: root, dependencies: [index] });

  const arrow = "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream transition-colors hover:bg-cream hover:text-ink sm:flex";

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} of ${items.length}: ${m.caption}`}
      className="fixed inset-0 z-[130] flex flex-col bg-ink/95 text-cream backdrop-blur-sm"
      onPointerDown={(e) => { swipeX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (swipeX.current === null) return;
        const dx = e.clientX - swipeX.current;
        swipeX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}>
      <div className="flex items-center justify-between px-5 py-4 md:px-10">
        <p className="font-display text-sm tabular-nums text-cream/70">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
        <button ref={closeBtn} onClick={onClose} aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-xl transition-colors hover:bg-cream hover:text-ink">✕</button>
      </div>

      <div className="relative flex-1" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div key={m.image} className="lb-photo pointer-events-none absolute inset-x-4 inset-y-0 md:inset-x-24">
          <Image src={m.image} alt={m.caption} fill sizes="100vw" className="object-contain" />
        </div>
        <button onClick={() => go(-1)} aria-label="Previous photo" className={`${arrow} left-4 md:left-8`}>←</button>
        <button onClick={() => go(1)} aria-label="Next photo" className={`${arrow} right-4 md:right-8`}>→</button>
      </div>

      <div className="px-5 pb-6 pt-4 text-center md:pb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-yellow">{m.place}</p>
        <p className="mt-1 font-display text-xl md:text-2xl">{m.caption}</p>
        <p className="mt-2 text-xs text-cream/50 sm:hidden">Swipe to browse</p>
      </div>
    </div>
  );
}
