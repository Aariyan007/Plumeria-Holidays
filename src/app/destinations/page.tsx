import Image from "next/image";
import Link from "next/link";
import { getDestinations } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Destinations", description: "Kerala, India and international destinations by Plumeria Holidays." };

export default function DestinationsPage() {
  const groups = [
    { label: "Kerala & India", items: getDestinations("domestic") },
    { label: "International", items: getDestinations("international") },
  ];
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Destinations" title="Every journey starts with a place" />
      {groups.map((g) => (
        <section key={g.label} className="mt-20">
          <h2 className="mb-8 text-xs uppercase tracking-[0.3em] text-coral-dark">{g.label}</h2>
          <Reveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {g.items.map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}`} className="group" data-cursor>
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                  <Image src={d.image} alt={d.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <h3 className="mt-4 font-display text-2xl">{d.name}</h3>
                <p className="text-sm text-ink/70">{d.tagline}</p>
              </Link>
            ))}
          </Reveal>
        </section>
      ))}
    </main>
  );
}
