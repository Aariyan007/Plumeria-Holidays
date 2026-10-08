import Image from "next/image";
import { getMemories } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Memories", description: "Moments from Plumeria Holidays travellers." };

export default function MemoriesPage() {
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Memories" title="Moments our travellers brought home" />
      <Reveal className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3">
        {getMemories().map((m, i) => (
          <figure key={m.image} className="mb-6 break-inside-avoid">
            <div className={`relative overflow-hidden rounded-3xl ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
              <Image src={m.image} alt={m.caption} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-sm text-ink/70">{m.caption}</figcaption>
          </figure>
        ))}
      </Reveal>
    </main>
  );
}
