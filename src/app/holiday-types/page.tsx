import Image from "next/image";
import Link from "next/link";
import { getDestination, getHolidayTypes, getPackages } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Holiday Types", description: "Group tours, honeymoons, Kerala houseboats and Lakshadweep cruises." };

export default function HolidayTypesPage() {
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Holiday types" title="Pick a mood, we'll find the place" />
      <div className="mt-16 space-y-16 md:mt-20 md:space-y-24">
        {getHolidayTypes().map((t, i) => {
          const pkgCount = getPackages({ type: t.slug }).length;
          return (
            <Reveal key={t.slug} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
              <div id={t.slug} className={`relative aspect-[4/3] scroll-mt-28 overflow-hidden rounded-3xl ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={t.image} alt={t.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div>
                <h2 className="font-display text-4xl lg:text-5xl">{t.name}</h2>
                <p className="mt-4 text-lg text-ink/75">{t.blurb}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {t.destinationSlugs.map((s) => getDestination(s)).filter((d) => d !== undefined).map((d) => (
                    <li key={d.slug}><Link href={`/destinations/${d.slug}`} className="inline-block rounded-full border border-ink/15 px-3 py-1.5 text-sm transition-colors hover:border-plum hover:text-plum">{d.name}</Link></li>
                  ))}
                </ul>
                <div className="mt-8">
                  {pkgCount > 0
                    ? <Button href={`/packages?type=${t.slug}`}>See {pkgCount} {t.name.toLowerCase()} {pkgCount === 1 ? "itinerary" : "itineraries"}</Button>
                    : <Button href="/contact">Plan a {t.name.toLowerCase().replace(/s$/, "")} trip</Button>}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </main>
  );
}
