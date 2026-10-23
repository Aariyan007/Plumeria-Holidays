import { getOffices } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const metadata = { title: "About Us", description: "Plumeria Holidays: a Kochi-based travel company crafting tailor-made journeys." };

const values = [
  { t: "Never compromise on quality", d: "Hand-picked stays, trusted drivers and partners we've worked with for years." },
  { t: "Made for you", d: "Every itinerary is shaped around your dates, pace and budget." },
  { t: "With you all the way", d: "Offices across India and in Bangkok, and a phone that's always answered." },
];

export default function AboutPage() {
  return (
    <main className="pb-24 pt-40">
      <section className="px-6 md:px-16">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-pink-dark">About us</p>
        <SplitReveal as="h1" immediate className="max-w-5xl font-display text-[clamp(2.5rem,12vw,3rem)] leading-[1.02] md:text-7xl lg:text-8xl">Born in Kochi. Travelling everywhere.</SplitReveal>
        <p className="mt-10 max-w-2xl text-lg text-ink/75">
          Plumeria Holidays is a Kochi-based travel company crafting holidays across India and the world, from houseboat nights in Alleppey to group tours to Dubai, Thailand and Azerbaijan. We handle flights, hotels, transfers and every detail between.
        </p>
      </section>
      <section className="mt-28 grid gap-10 bg-plum px-6 py-24 text-cream md:grid-cols-3 md:px-16">
        {values.map((v) => (
          <Reveal key={v.t}><h2 className="font-display text-2xl lg:text-3xl">{v.t}</h2><p className="mt-3 text-cream/80">{v.d}</p></Reveal>
        ))}
      </section>
      <section className="px-6 pt-28 md:px-16">
        <SectionHeading kicker="Offices" title="Seven cities, one team" />
        <Reveal className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {getOffices().map((o) => (
            // Phones: one compact row per office (city left, role right). Wider: stacked cards.
            <div key={o.city} className="flex flex-row-reverse items-baseline justify-between gap-4 rounded-2xl border border-ink/10 px-5 py-4 sm:block sm:rounded-3xl sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-pink-dark sm:text-xs sm:tracking-[0.3em]">{o.role}</p>
              {/* lg drops a step so Ahmedabad fits a quarter-width card at 1024px. */}
              <p className="font-display text-xl sm:mt-2 sm:text-2xl lg:text-xl xl:text-3xl">{o.city}</p>
            </div>
          ))}
        </Reveal>
      </section>
    </main>
  );
}
