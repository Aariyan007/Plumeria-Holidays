import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestination, getDestinations, getPackagesForDestination } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCard } from "@/components/ui/PackageCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const dynamicParams = false;
export const generateStaticParams = () => getDestinations().map((d) => ({ slug: d.slug }));

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const d = getDestination((await params).slug);
  return d ? { title: `${d.name} Tours`, description: `${d.tagline}. ${d.story}`, openGraph: { images: [d.image] } } : {};
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const d = getDestination((await params).slug);
  if (!d) notFound();
  const pkgs = getPackagesForDestination(d.slug);
  return (
    <main>
      <section data-dest-hero className="relative h-svh overflow-hidden text-cream">
        <Image src={d.image} alt={d.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-16 left-6 md:left-16">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-yellow">{d.tagline}</p>
          <SplitReveal as="h1" immediate className="font-display text-6xl md:text-9xl">{d.name}</SplitReveal>
        </div>
      </section>
      <section className="grid gap-16 px-6 py-24 md:grid-cols-2 md:px-16">
        <p className="font-display text-2xl leading-snug md:text-4xl">{d.story}</p>
        <Reveal>
          <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-pink-dark">Highlights</h2>
          <ul className="space-y-3 text-lg">{d.highlights.map((h) => <li key={h} className="border-b border-ink/10 pb-3">{h}</li>)}</ul>
          <p className="mt-8 text-sm text-ink/70">Best time to visit: <strong className="text-ink">{d.bestTime}</strong></p>
          <div className="mt-8"><Button href={`/contact?destination=${d.slug}`}>Plan a {d.name} trip</Button></div>
        </Reveal>
      </section>
      {pkgs.length > 0 && (
        <section className="bg-plum px-6 py-24 text-cream md:px-16">
          <SectionHeading light kicker="Packages" title={`Ways to see ${d.name}`} />
          <div className="mt-12 grid gap-8 md:grid-cols-3">{pkgs.map((p) => <PackageCard key={p.slug} pkg={p} />)}</div>
        </section>
      )}
    </main>
  );
}
