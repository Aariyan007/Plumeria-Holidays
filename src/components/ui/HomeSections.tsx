import Image from "next/image";
import Link from "next/link";
import { getFeaturedPackages, getHolidayTypes, getTestimonials } from "@/lib/data";
import { site } from "@/lib/site";
import { PackageCard } from "./PackageCard";
import { SectionHeading } from "./SectionHeading";
import { Button } from "./Button";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";

export function FeaturedPackages() {
  return (
    <section className="px-6 py-28 md:px-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading kicker="Featured" title="Journeys our travellers love" />
        <Button href="/packages" variant="ghost">All packages</Button>
      </div>
      <Reveal className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {getFeaturedPackages().slice(0, 6).map((p) => <PackageCard key={p.slug} pkg={p} />)}
      </Reveal>
    </section>
  );
}

export function HolidayTypesGrid() {
  return (
    <section className="bg-plum px-6 py-28 text-cream md:px-16">
      <SectionHeading light kicker="Holiday types" title="However you like to travel" />
      <Reveal className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getHolidayTypes().map((t) => (
          <Link key={t.slug} href={`/packages?type=${t.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl" data-cursor>
            <Image src={t.image} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-display text-3xl">{t.name}</h3>
              <p className="mt-1 text-sm text-cream/85 md:max-h-0 md:overflow-hidden md:transition-all md:duration-500 md:group-hover:max-h-20">{t.blurb}</p>
            </div>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}

// PLACEHOLDER stats: confirm real figures with the client before launch.
const stats = [
  { to: 15, suffix: "+", label: "Years of journeys" },
  { to: 25000, suffix: "+", label: "Happy travellers" },
  { to: 7, suffix: "", label: "Offices" },
  { to: 30, suffix: "+", label: "Destinations" },
];
export function Stats() {
  return (
    <section className="grid grid-cols-2 gap-10 px-6 py-24 md:grid-cols-4 md:px-16">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="font-display text-5xl text-plum md:text-7xl"><CountUp to={s.to} suffix={s.suffix} /></p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-ink/70">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="px-6 py-28 md:px-16">
      <SectionHeading kicker="Memories" title="Stories from the road" />
      <Reveal className="mt-14 grid gap-8 md:grid-cols-3">
        {getTestimonials().map((t) => (
          <figure key={t.name} className="rounded-3xl bg-white/70 p-8 shadow-sm">
            <blockquote className="font-display text-xl leading-snug">“{t.quote}”</blockquote>
            <figcaption className="mt-6 text-sm"><strong>{t.name}</strong> · <span className="text-ink/70">{t.trip}</span></figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="petal-gradient px-6 py-32 text-center md:px-16">
      <h2 className="mx-auto max-w-4xl font-display text-5xl leading-none text-ink md:text-8xl">Tell us the dream. We&apos;ll plan the rest.</h2>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button href="/contact">Plan my trip</Button>
        <Button href={site.whatsapp} variant="ghost" external>WhatsApp us</Button>
      </div>
    </section>
  );
}
