import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPackage, getPackages } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { tripLd } from "@/lib/seo";

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
      <JsonLd data={tripLd(p)} />
      <section data-dest-hero className="relative h-[80svh] overflow-hidden text-cream">
        <Image src={p.image} alt={p.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-14 left-6 right-6 md:left-16">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-yellow">
            {p.durationDays} days · {p.route.join(" → ")}
          </p>
          <SplitReveal as="h1" immediate className="font-display text-[clamp(2.25rem,11vw,3rem)] leading-[0.95] md:text-7xl lg:text-8xl">{p.title}</SplitReveal>
        </div>
      </section>
      <section className="grid gap-12 px-6 py-20 md:px-16 md:py-24 lg:grid-cols-[2fr_1fr] lg:gap-16">
        <div>
          <p className="font-display text-2xl md:text-3xl">{p.summary}</p>
          <ol className="relative mt-14 space-y-10 border-l border-fg/15 pl-8">
            {p.itinerary.map((d) => (
              <li key={d.day} className="relative">
                <span className="absolute -left-[39px] top-1.5 h-3 w-3 rounded-full bg-pink" aria-hidden />
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.3em] text-accent">{d.label ?? `Day ${d.day}`}</p>
                  <h2 className="mt-1 font-display text-2xl">{d.title}</h2>
                  <p className="mt-1 text-fg/70">{d.blurb}</p>
                  {d.meals && <p className="mt-2 text-sm text-fg/55">Meals: {d.meals}</p>}
                </Reveal>
              </li>
            ))}
          </ol>
          {p.itinerary.some((d) => d.label) && <p className="mt-8 text-sm text-fg/60">A typical outline; we&apos;ll send the exact day-by-day with your quote.</p>}
        </div>
        <aside className="h-fit rounded-3xl bg-plum p-6 text-cream sm:p-8 lg:sticky lg:top-28">
          <h2 className="text-xs uppercase tracking-[0.3em] text-yellow">Included</h2>
          {p.inclusions?.length
            ? <ul className="mt-4 space-y-2">{p.inclusions.map((i) => <li key={i}>· {i}</li>)}</ul>
            : <p className="mt-4 text-cream/80">Confirmed with your quote.</p>}
          {!!p.exclusions?.length && (
            <>
              <h2 className="mt-8 text-xs uppercase tracking-[0.3em] text-yellow">Not included</h2>
              <ul className="mt-4 space-y-2 text-cream/80">{p.exclusions.map((i) => <li key={i}>· {i}</li>)}</ul>
            </>
          )}
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
