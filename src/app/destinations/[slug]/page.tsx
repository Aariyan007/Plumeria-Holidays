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
        <div className="absolute bottom-16 left-6 right-6 md:left-16 md:right-16">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-yellow">{d.tagline}</p>
          <SplitReveal as="h1" immediate className="font-display text-[clamp(2.75rem,14vw,4.5rem)] leading-[0.95] md:text-8xl lg:text-9xl">{d.name}</SplitReveal>
        </div>
      </section>
      <section className="grid gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-16 md:py-24">
        <p className="font-display text-2xl leading-snug md:text-4xl">{d.story}</p>
        <Reveal>
          {d.highlights.length > 0 && (
            <>
              <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Highlights</h2>
              <ul className="mb-8 space-y-3 text-lg">{d.highlights.map((h) => <li key={h} className="border-b border-fg/10 pb-3">{h}</li>)}</ul>
            </>
          )}
          {d.bestTime && <p className="mb-8 text-sm text-fg/70">Best time to visit: <strong className="text-fg">{d.bestTime}</strong></p>}
          {pkgs.length === 0 && (
            <div className="mb-8 rounded-3xl border border-fg/10 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Itinerary on request</p>
              <p className="mt-2 text-fg/75">Tell us your dates and who&apos;s travelling, and we&apos;ll send a day-by-day plan for {d.name}.</p>
            </div>
          )}
          <Button href={`/contact?destination=${d.slug}`}>{pkgs.length ? `Plan a ${d.name} trip` : `Enquire about ${d.name}`}</Button>
        </Reveal>
      </section>
      {pkgs.length > 0 && (
        <section className="bg-plum px-6 py-24 text-cream md:px-16">
          <SectionHeading light kicker="Packages" title={`Ways to see ${d.name}`} />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{pkgs.map((p) => <PackageCard key={p.slug} pkg={p} />)}</div>
        </section>
      )}
    </main>
  );
}
