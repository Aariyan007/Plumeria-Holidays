import Image from "next/image";
import { getHolidayTypes, getPackages } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Holiday Types", description: "Honeymoon, family, houseboat, adventure, group and cruise holidays." };

export default function HolidayTypesPage() {
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Holiday types" title="Pick a mood, we'll find the place" />
      <div className="mt-20 space-y-24">
        {getHolidayTypes().map((t, i) => (
          <Reveal key={t.slug} className="grid items-center gap-10 md:grid-cols-2">
            <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={t.image} alt={t.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <h2 className="font-display text-5xl">{t.name}</h2>
              <p className="mt-4 text-lg text-ink/75">{t.blurb}</p>
              <p className="mt-2 text-sm text-ink/60">{getPackages({ type: t.slug }).length} packages</p>
              <div className="mt-8"><Button href={`/packages?type=${t.slug}`}>See {t.name.toLowerCase()} packages</Button></div>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
