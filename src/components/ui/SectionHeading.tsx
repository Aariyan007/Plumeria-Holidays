import { SplitReveal } from "@/components/motion/SplitReveal";

export function SectionHeading({ kicker, title, intro, light = false }:
  { kicker: string; title: string; intro?: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-gold" : "text-coral-dark"}`}>{kicker}</p>
      <SplitReveal className="font-display text-4xl leading-[1.05] md:text-6xl">{title}</SplitReveal>
      {intro && <p className={`mt-6 text-lg ${light ? "text-cream/80" : "text-ink/70"}`}>{intro}</p>}
    </div>
  );
}
