import { getDestinations, getPackagesForDestination, type Destination, type Region } from "@/lib/data";
import { site } from "@/lib/site";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { DestinationCard } from "@/components/ui/DestinationCard";

export const metadata = { title: "Destinations", description: "Kerala, India and international destinations by Plumeria Holidays." };

const regions: { region: Region; id: string; label: string; title: string; intro: string }[] = [
  { region: "domestic", id: "india", label: "Kerala & India", title: "Close to home",
    intro: "Backwaters and hill stations next door, and India's great circuits a short flight from Kochi." },
  { region: "international", id: "abroad", label: "International", title: "Further afield",
    intro: "Beaches, cities and islands abroad, with flights, visas and hotels arranged from Kochi." },
];

/** Days in the destination's shortest published itinerary, if it has one. */
const itineraryDays = (d: Destination) => {
  const days = getPackagesForDestination(d.slug).map((p) => p.durationDays);
  return days.length ? Math.min(...days) : undefined;
};

/**
 * Grid spans so no row ends half empty: the lead card is 2x2, and the cards in a short last row widen to fill it
 * (2 columns on phones, 4 on large screens, where the lead's two rows hold the first four small cards).
 */
function spanFor(i: number, n: number) {
  if (i === 0) return "col-span-2 row-span-2 sm:p-8";
  const small = n - 1, k = i - 1; // position among the small cards
  const phone = small % 2 === 1 && k === small - 1 ? "col-span-2" : "";
  const lastRow = small > 4 ? (small - 4) % 4 : 0, fromEnd = small - 1 - k;
  let wide = phone ? "lg:col-span-1" : "";
  if (lastRow === 1 && fromEnd === 0) wide = "lg:col-span-4";
  if (lastRow === 2 && fromEnd <= 1) wide = "lg:col-span-2";
  if (lastRow === 3 && fromEnd === 0) wide = "lg:col-span-2";
  return `${phone} ${wide}`;
}

export default function DestinationsPage() {
  const all = getDestinations();
  const withItinerary = all.filter((d) => itineraryDays(d)).length;
  const stat = "font-display text-3xl tracking-normal text-plum md:text-4xl";

  return (
    <main className="pb-24 pt-32 md:pt-40">
      <section className="px-6 md:px-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-pink-dark">Destinations</p>
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <SplitReveal as="h1" immediate className="font-display text-[clamp(2.5rem,12vw,3rem)] leading-[1.02] md:text-6xl xl:text-7xl">Every journey starts with a place</SplitReveal>
          <p className="max-w-md text-lg text-ink/75">From the backwaters outside our door in Kochi to Bali, Dubai and Europe. Pick a place and we&apos;ll plan the rest around you.</p>
        </div>
        <dl className="mt-10 flex flex-wrap gap-x-6 gap-y-4 border-y border-ink/10 py-6 text-xs uppercase tracking-[0.2em] text-ink/60 sm:gap-x-10">
          <div className="flex items-baseline gap-2"><dt className="sr-only">Destinations</dt><dd className={stat}>{all.length}</dd> places</div>
          <div className="flex items-baseline gap-2"><dt className="sr-only">With a day-by-day itinerary</dt><dd className={stat}>{withItinerary}</dd> ready itineraries</div>
          <div className="flex items-baseline gap-2"><dt className="sr-only">Countries and regions abroad</dt><dd className={stat}>{getDestinations("international").length}</dd> abroad</div>
        </dl>
        <nav aria-label="Jump to region" className="mt-6 flex flex-wrap gap-2">
          {regions.map((r) => (
            <a key={r.id} href={`#${r.id}`}
              className="rounded-full border border-ink/15 px-5 py-2 text-sm transition-colors hover:border-plum hover:bg-plum hover:text-cream">
              {r.label} <span className="text-ink/45">{getDestinations(r.region).length}</span>
            </a>
          ))}
        </nav>
      </section>

      {regions.map((r) => {
        // Places with a published itinerary lead the grid; the rest follow as "on request".
        const items = getDestinations(r.region)
          .map((d) => ({ d, days: itineraryDays(d) }))
          .sort((a, b) => Number(!!b.days) - Number(!!a.days));
        return (
          <section key={r.id} id={r.id} className="mt-24 scroll-mt-28 px-6 md:px-16" aria-labelledby={`${r.id}-title`}>
            <div className="mb-10 grid items-end gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-dark">{r.label}</p>
                <h2 id={`${r.id}-title`} className="mt-3 font-display text-[clamp(2rem,9vw,2.5rem)] leading-[1.05] md:text-5xl">{r.title}</h2>
              </div>
              <p className="max-w-md text-ink/70">{r.intro}</p>
            </div>
            <Reveal className="grid auto-rows-[13rem] grid-cols-2 gap-3 sm:auto-rows-[16rem] sm:gap-4 lg:grid-cols-4">
              {items.map(({ d, days }, i) => <DestinationCard key={d.slug} d={d} days={days} lead={i === 0} span={spanFor(i, items.length)} />)}
            </Reveal>
          </section>
        );
      })}

      <section className="mx-6 mt-24 flex flex-wrap items-end justify-between gap-8 rounded-[2.5rem] bg-plum px-6 py-12 text-cream md:mx-16 md:px-12 md:py-16">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow">Somewhere else in mind?</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,9vw,2.5rem)] leading-[1.05] md:text-5xl">Tell us where, we&apos;ll plan the how</h2>
          <p className="mt-4 text-cream/75">Share the place, your dates and who&apos;s travelling. We&apos;ll send back a day-by-day plan.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/contact">Plan my trip</Button>
          <Button href={site.whatsapp} variant="ghost" external>Chat on WhatsApp</Button>
        </div>
      </section>
    </main>
  );
}
