import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/data/types";

type CardDestination = Pick<Destination, "slug" | "name" | "tagline" | "image"> & { story?: string };

/**
 * Photo card with the name over the image, badged with the itinerary length or "On request".
 * `lead` is the large 2x2 card (shows the story too); `span` adds grid placement classes.
 */
export function DestinationCard({ d, days, lead = false, span = "" }: { d: CardDestination; days?: number; lead?: boolean; span?: string }) {
  return (
    <Link href={`/destinations/${d.slug}`} data-cursor
      className={`group relative isolate flex min-w-0 flex-col justify-end overflow-hidden rounded-3xl bg-plum p-4 text-cream sm:p-6 ${span}`}>
      <Image src={d.image} alt={d.name} fill sizes={lead ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 33vw, 50vw"}
        className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105" />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
      <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold sm:left-5 sm:top-5 sm:text-xs ${days ? "bg-yellow text-ink" : "bg-cream/90 text-ink"}`}>
        {days ? `${days}-day itinerary` : "On request"}
      </span>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/75 sm:text-xs ${lead ? "" : "line-clamp-1"}`}>{d.tagline}</p>
      {/* Sized so the longest single word ("Lakshadweep") still fits a half-width card on 360px+ phones. */}
      <h3 className={`mt-1 break-words font-display leading-[1.05] ${lead ? "text-[clamp(1.75rem,8vw,3.5rem)]" : "text-[clamp(0.95rem,4.2vw,1.6rem)]"}`}>{d.name}</h3>
      {lead && d.story && <p className="mt-3 hidden max-w-md text-cream/80 sm:block">{d.story}</p>}
      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cream/80 transition-colors group-hover:text-yellow">
        Explore <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
