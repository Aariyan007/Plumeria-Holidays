import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestination, getPackage, getPackages } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const dynamicParams = false;
export const generateStaticParams = () => getPackages().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const p = getPackage((await params).slug);
  return p ? { title: `${p.title} (${p.durationDays} days)`, description: p.summary, openGraph: { images: [p.image] } } : {};
}

export default async function PackagePage({ params }: PageProps<"/packages/[slug]">) {
  const p = getPackage((await params).slug);
  if (!p) notFound();
  return (
    <main>
      <section data-dest-hero className="relative h-[80svh] overflow-hidden text-cream">
        <Image src={p.image} alt={p.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-14 left-6 right-6 md:left-16">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">
            {p.durationDays} days · {p.destinationSlugs.map((s) => getDestination(s)?.name).join(" · ")}
          </p>
          <SplitReveal as="h1" immediate className="font-display text-5xl md:text-8xl">{p.title}</SplitReveal>
        </div>
      </section>
      <section className="grid gap-16 px-6 py-24 md:grid-cols-[2fr_1fr] md:px-16">
        <div>
          <p className="font-display text-2xl md:text-3xl">{p.summary}</p>
          <ol className="relative mt-14 space-y-10 border-l border-ink/15 pl-8">
            {p.itinerary.map((d) => (
              <li key={d.day} className="relative">
                <span className="absolute -left-[39px] top-1.5 h-3 w-3 rounded-full bg-coral" aria-hidden />
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.3em] text-coral-dark">Day {d.day}</p>
                  <h2 className="mt-1 font-display text-2xl">{d.title}</h2>
                  <p className="mt-1 text-ink/70">{d.blurb}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
        <aside className="h-fit rounded-3xl bg-teal p-8 text-cream md:sticky md:top-28">
          <h2 className="text-xs uppercase tracking-[0.3em] text-gold">Included</h2>
          <ul className="mt-4 space-y-2">{p.inclusions.map((i) => <li key={i}>· {i}</li>)}</ul>
          <p className="mt-6 text-sm text-cream/80">
            {p.priceFrom ? `From ₹${p.priceFrom.toLocaleString("en-IN")} per person` : "Price on request, tailored to your dates."}
          </p>
          <div className="mt-8"><Button href={`/contact?package=${p.slug}`}>Enquire now</Button></div>
          <Link href="/packages" className="mt-6 block text-sm underline underline-offset-4">All packages</Link>
        </aside>
      </section>
    </main>
  );
}
