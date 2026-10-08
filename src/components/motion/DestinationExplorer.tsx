"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { expandToPage } from "./TransitionOverlay";

export function DestinationExplorer({ destinations }: { destinations: Destination[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const dist = () => track.current!.scrollWidth - window.innerWidth + 64;
      const tween = gsap.to(track.current, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]", root.current).forEach((img) =>
        gsap.fromTo(img, { xPercent: -6 }, {
          xPercent: 6, ease: "none",
          scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        }));
    });
    return () => mm.revert();
  }, { scope: root });

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, d: Destination) => {
    if (prefersReducedMotion() || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    expandToPage(e.currentTarget.querySelector("[data-card-img]") as HTMLElement, d.image, `/destinations/${d.slug}`, router);
  };

  return (
    <section ref={root} className="overflow-hidden bg-cream py-24 md:flex md:h-svh md:items-center md:py-0" aria-label="Destinations">
      <div ref={track} className="flex gap-6 px-6 max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto md:px-16">
        <div className="flex w-[80vw] shrink-0 flex-col justify-center md:w-[32vw]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-coral-dark">Where to next</p>
          <h2 className="font-display text-5xl leading-none md:text-7xl">Places we know by heart</h2>
          <Link href="/destinations" className="mt-8 underline underline-offset-4 hover:text-coral-dark">All destinations</Link>
        </div>
        {destinations.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} onClick={(e) => onClick(e, d)}
            className="group relative w-[75vw] shrink-0 snap-center md:w-[28vw]" data-cursor>
            <div data-card-img className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image data-parallax src={d.image} alt={d.name} fill sizes="(min-width:768px) 28vw, 75vw"
                className="scale-125 object-cover transition-transform duration-700 group-hover:scale-[1.35]" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ink/60">{d.tagline}</p>
            <h3 className="font-display text-3xl">{d.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
