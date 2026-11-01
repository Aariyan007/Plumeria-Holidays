import { getMemories, getMemoryTags, getTestimonials } from "@/lib/data";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { MemoryGallery } from "@/components/motion/MemoryGallery";
import { PolaroidStack } from "@/components/motion/PolaroidStack";

export const metadata = { title: "Memories", description: "Moments from Plumeria Holidays travellers." };

const shareHref = `${site.whatsapp}?text=${encodeURIComponent("Hi Plumeria! Here are some photos from my trip for your Memories wall.")}`;

export default function MemoriesPage() {
  const memories = getMemories();
  const places = new Set(memories.map((m) => m.place)).size;
  return (
    <main className="pb-24 pt-32 md:pt-40">
      <section className="grid items-center gap-10 px-6 md:px-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">Memories</p>
          <SplitReveal as="h1" immediate className="font-display text-[clamp(2.5rem,12vw,3rem)] leading-[1.02] md:text-6xl lg:text-[3.5rem] xl:text-7xl">Moments our travellers brought home</SplitReveal>
          <p className="mt-6 max-w-lg text-lg text-fg/75">Houseboat sunsets, sadya lunches, misty tea hills. A scrapbook of the little things that made each trip.</p>
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-[0.2em] text-fg/60">
            <span><strong className="font-display text-2xl tracking-normal text-heading">{memories.length}</strong> moments</span>
            <span><strong className="font-display text-2xl tracking-normal text-heading">{places}</strong> places</span>
          </p>
        </div>
        <PolaroidStack photos={[memories[3], memories[0], memories[5]]} />
      </section>

      <section className="mt-16 px-6 md:mt-24 md:px-16" aria-label="Photo wall">
        <MemoryGallery memories={memories} tags={getMemoryTags()} quotes={getTestimonials()} />
      </section>

      <section className="mx-6 mt-20 grid items-center gap-8 rounded-[2.5rem] bg-plum px-7 py-12 text-cream md:mx-16 md:mt-28 md:grid-cols-[1fr_auto] md:gap-12 md:p-16">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow">Travelled with us?</p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,9vw,2.5rem)] leading-[1.05] md:text-5xl">Your photo could be on this wall</h2>
          <p className="mt-4 max-w-xl text-cream/80">Send us your favourite trip photos on WhatsApp and we&apos;ll add them here, with your name if you&apos;d like.</p>
        </div>
        <div><Button href={shareHref} external>Share on WhatsApp</Button></div>
      </section>
    </main>
  );
}
