import { getDestination, getOffices, getPackage } from "@/lib/data";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/ui/ContactForm";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const metadata = { title: "Contact", description: "Plan your holiday with Plumeria Holidays, Kochi." };

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const pkg = one(sp.package) ? getPackage(one(sp.package)!) : undefined;
  const dest = one(sp.destination) ? getDestination(one(sp.destination)!) : undefined;
  const msg = pkg ? `I'm interested in the ${pkg.title} package.` : dest ? `I'd like to plan a trip to ${dest.name}.` : "";
  return (
    <main className="grid gap-16 px-6 pb-24 pt-40 md:grid-cols-2 md:px-16">
      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-pink-dark">Contact</p>
        <SplitReveal as="h1" immediate className="font-display text-5xl leading-none md:text-7xl">Let&apos;s plan something beautiful</SplitReveal>
        <div className="mt-10 space-y-2 text-lg">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="block hover:text-pink-dark">{site.phone}</a>
          <a href={`mailto:${site.email}`} className="block break-all hover:text-pink-dark">{site.email}</a>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="block text-leaf hover:text-pink-dark">Chat on WhatsApp</a>
        </div>
        <p className="mt-10 text-sm text-ink/70">Offices: {getOffices().map((o) => `${o.city}${o.role === "HQ" ? " (HQ)" : ""}`).join(", ")}</p>
      </div>
      <ContactForm key={msg} defaultMessage={msg} packageSlug={pkg?.slug} />
    </main>
  );
}
