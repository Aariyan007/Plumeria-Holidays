import Link from "next/link";
import { site } from "@/lib/site";
import { getOffices } from "@/lib/data";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink px-6 pb-10 pt-24 text-cream md:px-16">
      <div className="grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3"><Logo className="h-12 w-12" /><span className="font-display text-3xl">Plumeria Holidays</span></div>
          <p className="mt-4 max-w-sm text-cream/70">{site.tagline}. Tailor-made journeys from Kochi to the world.</p>
        </div>
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.3em] text-yellow">Explore</h3>
          {site.nav.map((n) => <Link key={n.href} href={n.href} className="block py-1 text-cream/80 hover:text-pink">{n.label}</Link>)}
          <a href={site.paymentUrl} target="_blank" rel="noopener noreferrer" className="block py-1 text-cream/80 hover:text-pink">Make a payment</a>
        </div>
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.3em] text-yellow">Talk to us</h3>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="block py-1">{site.phone}</a>
          <a href={`mailto:${site.email}`} className="block break-all py-1">{site.email}</a>
          <p className="mt-4 text-sm text-cream/60">{getOffices().map((o) => o.city).join(" · ")}</p>
        </div>
      </div>
      <p className="mt-16 text-xs text-cream/50">© Plumeria Holidays. All rights reserved. Photos: Wikimedia Commons contributors.</p>
    </footer>
  );
}
