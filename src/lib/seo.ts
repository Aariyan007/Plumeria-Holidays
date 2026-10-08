import { site } from "@/lib/site";
import { getOffices, type Package } from "@/lib/data";

export const travelAgencyLd = () => ({
  "@context": "https://schema.org", "@type": "TravelAgency", name: site.name, url: site.url,
  telephone: site.phone, email: site.email,
  address: { "@type": "PostalAddress", addressLocality: "Kochi", addressRegion: "Kerala", addressCountry: "IN" },
  areaServed: getOffices().map((o) => o.city),
});

export const tripLd = (p: Package) => ({
  "@context": "https://schema.org", "@type": "TouristTrip", name: p.title, description: p.summary,
  url: `${site.url}/packages/${p.slug}`, image: `${site.url}${p.image}`,
  itinerary: {
    "@type": "ItemList",
    itemListElement: p.itinerary.map((d) => ({ "@type": "ListItem", position: d.day, name: d.title, description: d.blurb })),
  },
  provider: { "@type": "TravelAgency", name: site.name, url: site.url },
});
