import Image from "next/image";
import Link from "next/link";
import { getDestinations, getFeaturedPackages, getHolidayTypes, getOffices, getTestimonials } from "@/lib/data";
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
      <Reveal className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {getHolidayTypes().map((t) => (
          <Link key={t.slug} href={`/holiday-types#${t.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[3/4]" data-cursor>
            <Image src={t.image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 lg:bottom-5 lg:left-5 lg:right-5">
              <h3 className="font-display text-3xl lg:text-2xl xl:text-3xl">{t.name}</h3>
              {/* Hover-to-reveal only where hover exists; touch tablets always show the blurb. */}
              <p className="mt-1 text-sm text-cream/85 pointer-fine:max-h-0 pointer-fine:overflow-hidden pointer-fine:transition-all pointer-fine:duration-500 pointer-fine:group-hover:max-h-20">{t.blurb}</p>
            </div>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}

export function Stats() {
  // PLACEHOLDER years/travellers: confirm real figures with the client before launch. Offices and destinations are counted from content.
  const stats = [
    { to: 15, suffix: "+", label: "Years of journeys" },
    { to: 25000, suffix: "+", label: "Happy travellers" },
    { to: getOffices().length, suffix: "", label: "Offices" },
    { to: getDestinations().length, suffix: "", label: "Destinations" },
  ];
  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-10 px-6 py-24 md:px-16 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label}>
          {/* Sized so "25,000+" fits a half-width column down to 320px. */}
          <p className="font-display text-[clamp(1.75rem,9vw,3rem)] text-heading xl:text-6xl 2xl:text-7xl"><CountUp to={s.to} suffix={s.suffix} /></p>
          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-fg/70 sm:text-sm sm:tracking-[0.2em]">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="px-6 py-28 md:px-16">
      <SectionHeading kicker="Memories" title="Stories from the road" />
      <Reveal className="mt-14 grid gap-6 md:gap-8 lg:grid-cols-3">
        {getTestimonials().map((t) => (
          <figure key={t.name} className="rounded-3xl bg-card/70 p-6 shadow-sm sm:p-8">
            <blockquote className="font-display text-xl leading-snug">“{t.quote}”</blockquote>
            <figcaption className="mt-6 text-sm"><strong>{t.name}</strong> · <span className="text-fg/70">{t.trip}</span></figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="petal-gradient px-6 py-32 text-center md:px-16">
      <h2 className="mx-auto max-w-4xl font-display text-[clamp(2.5rem,12vw,3rem)] leading-none text-fg md:text-7xl lg:text-8xl">Tell us the dream. We&apos;ll plan the rest.</h2>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button href="/contact">Plan my trip</Button>
        <Button href={site.whatsapp} variant="ghost" external>WhatsApp us</Button>
      </div>
    </section>
  );
}
