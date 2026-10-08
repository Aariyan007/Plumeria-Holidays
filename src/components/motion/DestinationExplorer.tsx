"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { expandToPage } from "./TransitionOverlay";

/**
 * Vertical destination gallery: sticky intro column (native CSS sticky, never hijacks scroll)
 * beside a staggered two-column grid whose images drift gently as they pass.
 */
export function DestinationExplorer({ destinations }: { destinations: Destination[] }) {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) =>
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      }));
    gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) =>
      gsap.from(card, {
        y: 80, autoAlpha: 0, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: card, start: "top 90%" },
      }));
  }, { scope: root });

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, d: Destination) => {
    if (prefersReducedMotion() || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    expandToPage(e.currentTarget.querySelector("[data-card-img]") as HTMLElement, d.image, `/destinations/${d.slug}`, router);
  };

  return (
    <section ref={root} className="grid gap-12 px-6 py-28 md:grid-cols-[1fr_2fr] md:px-16" aria-label="Destinations">
      <div className="md:sticky md:top-32 md:h-fit">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-pink-dark">Where to next</p>
        <h2 className="font-display text-5xl leading-none md:text-7xl">Places we know by heart</h2>
        <p className="mt-6 max-w-sm text-ink/70">From misty tea hills to island lagoons, every place here is one we&apos;ve walked, tasted and planned a hundred times.</p>
        <Link href="/destinations" className="mt-8 inline-block underline underline-offset-4 hover:text-pink-dark">All destinations</Link>
      </div>
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {destinations.map((d, i) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} onClick={(e) => onClick(e, d)}
            className={`group block ${i % 2 ? "sm:mt-24" : ""}`} data-card data-cursor>
            <div data-card-img className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <div className="absolute -inset-y-[10%] inset-x-0" data-parallax>
                <Image src={d.image} alt={d.name} fill sizes="(min-width:768px) 30vw, 90vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-ink">0{i + 1}</span>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ink/60">{d.tagline}</p>
            <h3 className="font-display text-3xl transition-colors group-hover:text-pink-dark">{d.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
