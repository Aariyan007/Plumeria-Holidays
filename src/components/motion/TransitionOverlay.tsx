"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

type Router = { push: (href: string) => void };
let overlayEl: HTMLDivElement | null = null;

/** Expands the card image to full screen, then navigates; the overlay fades once the new page's hero is ready. */
export function expandToPage(card: HTMLElement, imageSrc: string, href: string, router: Router) {
  const el = overlayEl;
  if (!el) return router.push(href);
  const r = card.getBoundingClientRect();
  el.querySelector("img")!.src = imageSrc;
  gsap.set(el, { display: "block", top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: 24, opacity: 1 });
  gsap.to(el, {
    top: 0, left: 0, width: "100vw", height: "100svh", borderRadius: 0, duration: 0.8, ease: "expo.inOut",
    onComplete: () => router.push(href),
  });
}

export function TransitionOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => { overlayEl = ref.current; return () => { overlayEl = null; }; }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.style.display !== "block") return;
    const fade = () => gsap.to(el, { opacity: 0, duration: 0.5, delay: 0.1, overwrite: true, onComplete: () => { gsap.set(el, { display: "none" }); } });
    const hero = document.querySelector<HTMLImageElement>("[data-dest-hero] img");
    if (!hero || hero.complete) fade(); else hero.addEventListener("load", fade, { once: true });
    const safety = setTimeout(fade, 1500);
    return () => clearTimeout(safety);
  }, [pathname]);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed z-[120] hidden overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="h-full w-full object-cover" />
    </div>
  );
}
