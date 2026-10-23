import Image from "next/image";
import Link from "next/link";
import { getDestinations, getPackagedHolidayTypes, getPackages, getPackagesForDestination, type HolidayTypeSlug } from "@/lib/data";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { PackageFilter } from "@/components/motion/PackageFilter";

export const metadata = { title: "Tour Packages", description: "Domestic and international tour packages from Kochi, Kerala." };

export default async function PackagesPage({ searchParams }: PageProps<"/packages">) {
  const types = getPackagedHolidayTypes();
  const t = (await searchParams).type;
  const initialType = types.find((x) => x.slug === t)?.slug as HolidayTypeSlug | undefined;
  const packages = getPackages();
  const domestic = packages.filter((p) => p.region === "domestic").length;
  const onRequest = getDestinations().filter((d) => getPackagesForDestination(d.slug).length === 0);
  const stat = "font-display text-3xl tracking-normal text-plum md:text-4xl";

  return (
    <main className="pb-24 pt-32 md:pt-40">
      <section className="px-6 md:px-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-pink-dark">Packages</p>
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <SplitReveal as="h1" immediate className="font-display text-[clamp(2.5rem,12vw,3rem)] leading-[1.02] md:text-6xl xl:text-7xl">Ready-made journeys, made to bend</SplitReveal>
          <p className="max-w-md text-lg text-ink/75">Day-by-day itineraries from Kochi. Tell us your dates and we&apos;ll tailor hotels, pace and budget around them.</p>
        </div>
        <dl className="mt-10 flex flex-wrap gap-x-6 gap-y-4 sm:gap-x-10 border-y border-ink/10 py-6 text-xs uppercase tracking-[0.2em] text-ink/60">
          <div className="flex items-baseline gap-2"><dt className="sr-only">Itineraries</dt><dd className={stat}>{packages.length}</dd> itineraries</div>
          <div className="flex items-baseline gap-2"><dt className="sr-only">In India</dt><dd className={stat}>{domestic}</dd> in India</div>
          <div className="flex items-baseline gap-2"><dt className="sr-only">Abroad</dt><dd className={stat}>{packages.length - domestic}</dd> abroad</div>
        </dl>
      </section>

      <section className="mt-10 px-6 md:px-16" aria-label="Itineraries">
        <PackageFilter packages={packages} types={types} initialType={initialType} />
      </section>

      {onRequest.length > 0 && (
        <section className="mx-6 mt-24 rounded-[2.5rem] bg-plum px-6 py-12 text-cream md:mx-16 md:px-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-yellow">Itinerary on request</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,9vw,2.5rem)] leading-[1.05] md:text-5xl">More places we&apos;ll plan for you</h2>
            </div>
            <p className="max-w-sm text-cream/75">No fixed plan for these yet. Share your dates and we&apos;ll send a day-by-day itinerary.</p>
          </div>
          <Reveal className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {onRequest.map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}`} data-cursor
                className="group flex min-w-0 items-center gap-3 rounded-2xl bg-cream/5 p-2 pr-4 ring-1 ring-cream/10 transition-colors hover:bg-cream/10">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-16">
                  <Image src={d.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base leading-tight sm:text-lg">{d.name}</span>
                  <span className="block truncate text-sm text-cream/60">{d.tagline}</span>
                </span>
                <span aria-hidden className="ml-auto hidden text-cream/40 transition-transform group-hover:translate-x-1 group-hover:text-yellow sm:inline">→</span>
              </Link>
            ))}
          </Reveal>
        </section>
      )}
    </main>
  );
}
