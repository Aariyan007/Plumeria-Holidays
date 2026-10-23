"use client";
import Image from "next/image";
import { useRef } from "react";
import type { Memory } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

// Resting tilt and position of each print; on hover the stack fans out.
const POSE = [
  "left-[4%] top-[14%] -rotate-[9deg] group-hover:-translate-x-6 group-hover:-rotate-[14deg]",
  "right-[4%] top-[4%] rotate-[7deg] group-hover:translate-x-6 group-hover:rotate-[12deg]",
  "left-1/2 top-[30%] -translate-x-1/2 -rotate-[2deg] group-hover:-translate-y-4 group-hover:rotate-0",
];

/** Three photo prints dropped onto the page, fanning out on hover. */
export function PolaroidStack({ photos }: { photos: Memory[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const drop = () => gsap.from(".pd-card", { y: 140, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.15 });
    // On a full page load the preloader covers this; wait for it so the drop is seen.
    if (!document.documentElement.dataset.loading) return void drop();
    window.addEventListener("preloader:done", drop, { once: true });
    return () => window.removeEventListener("preloader:done", drop);
  }, { scope: root });

  return (
    <div ref={root} className="group relative mx-auto h-[340px] w-full max-w-md sm:h-[440px]" aria-hidden>
      {photos.slice(0, 3).map((p, i) => (
        <figure key={p.image} className={`pd-card absolute w-44 bg-white p-2.5 pb-10 shadow-xl shadow-ink/15 transition-[translate,rotate] duration-500 sm:w-56 sm:p-3 sm:pb-12 ${POSE[i]}`}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src={p.image} alt="" fill sizes="(min-width:640px) 224px, 176px" className="object-cover" />
          </div>
          <figcaption className="absolute inset-x-3 bottom-2.5 truncate font-display text-sm text-ink/80 sm:bottom-3.5">{p.place}</figcaption>
        </figure>
      ))}
    </div>
  );
}
