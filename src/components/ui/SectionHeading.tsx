import { SplitReveal } from "@/components/motion/SplitReveal";

export function SectionHeading({ kicker, title, intro, light = false }:
  { kicker: string; title: string; intro?: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-yellow" : "text-pink-dark"}`}>{kicker}</p>
      <SplitReveal className="font-display text-[clamp(1.875rem,9.5vw,2.25rem)] leading-[1.05] md:text-5xl lg:text-6xl">{title}</SplitReveal>
      {intro && <p className={`mt-6 text-lg ${light ? "text-cream/80" : "text-ink/70"}`}>{intro}</p>}
    </div>
  );
}
