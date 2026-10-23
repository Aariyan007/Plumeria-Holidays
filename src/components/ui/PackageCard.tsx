import Image from "next/image";
import Link from "next/link";
import type { Package } from "@/lib/data/types";

/** Itinerary card: photo with length and region, then route, summary and a "view itinerary" footer. Always a light card, so it reads on cream and plum. */
export function PackageCard({ pkg }: { pkg: Package }) {
  const nights = pkg.durationDays - 1;
  return (
    <Link href={`/packages/${pkg.slug}`} data-cursor data-flip-id={pkg.slug}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white text-ink shadow-sm ring-1 ring-ink/5 transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={pkg.image} alt={pkg.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/50 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold">
          {pkg.durationDays} days · {nights} {nights === 1 ? "night" : "nights"}
        </span>
        <span className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.25em] text-cream">
          {pkg.region === "domestic" ? "India" : "International"}
        </span>
        {pkg.holidayTypes.includes("group") && (
          <span className="absolute right-4 top-4 rounded-full bg-yellow px-3 py-1 text-xs font-semibold">Group tour</span>
        )}
      </div>
      <div className="@container flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-2xl leading-tight">{pkg.title}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-pink-dark">
          {pkg.route.map((stop, i) => (
            <span key={stop} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden className="text-ink/30">→</span>}{stop}
            </span>
          ))}
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-ink/70">{pkg.summary}</p>
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-ink/50">{pkg.priceFrom ? `From ₹${pkg.priceFrom.toLocaleString("en-IN")}` : "Price on request"}</span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold">
              {/* Full label only when the card is wide enough to keep the footer on one line. */}
              <span className="@[17.5rem]:hidden">View</span><span className="hidden @[17.5rem]:inline">View itinerary</span>
              <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-plum text-cream transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
