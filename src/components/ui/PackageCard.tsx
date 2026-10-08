import Image from "next/image";
import Link from "next/link";
import type { Package } from "@/lib/data/types";

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Link href={`/packages/${pkg.slug}`} className="group block" data-cursor data-flip-id={pkg.slug}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
        <Image src={pkg.image} alt={pkg.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-ink">
          {pkg.durationDays}D / {pkg.durationDays - 1}N
        </span>
      </div>
      <h3 className="mt-4 font-display text-2xl">{pkg.title}</h3>
      <p className="mt-1 text-sm opacity-75">{pkg.summary}</p>
    </Link>
  );
}
