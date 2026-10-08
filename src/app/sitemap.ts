import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getDestinations, getPackages } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/destinations", "/packages", "/holiday-types", "/about", "/memories", "/contact"];
  return [
    ...staticPaths.map((p) => ({ url: `${site.url}${p}` })),
    ...getDestinations().map((d) => ({ url: `${site.url}/destinations/${d.slug}` })),
    ...getPackages().map((p) => ({ url: `${site.url}/packages/${p.slug}` })),
  ];
}
