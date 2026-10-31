import { getDestination, getPackagesForDestination, type Destination } from "@/lib/data";

/** Visitor location as the host reports it; any part can be missing (localhost, VPNs, unknown IPs). */
export interface Geo { country?: string; region?: string; city?: string }

type Segment = "kerala" | "india" | "gulf" | "world";

const GULF: Record<string, string> = { AE: "the UAE", SA: "Saudi Arabia", QA: "Qatar", OM: "Oman", KW: "Kuwait", BH: "Bahrain" };

/**
 * Who sees what (destination slugs, best first):
 * - Kerala: locals don't book Kerala holidays, so lead with trips out of the state and abroad.
 * - Rest of India: Kerala first (houseboats, hills, the Lakshadweep cruise), then the other favourites.
 * - Gulf: the large Kerala diaspora comes home on holiday; add the short hop to Azerbaijan.
 * - Anywhere else / unknown: Kerala and India highlights.
 */
const PICKS: Record<Segment, string[]> = {
  kerala: ["kashmir", "golden-triangle", "thailand", "dubai", "bali", "vietnam"],
  india: ["alleppey", "munnar", "lakshadweep", "kashmir", "goa", "andaman"],
  gulf: ["alleppey", "munnar", "lakshadweep", "azerbaijan", "kashmir", "golden-triangle"],
  world: ["alleppey", "munnar", "golden-triangle", "kashmir", "lakshadweep", "goa"],
};

function segmentFor({ country, region }: Geo): Segment {
  if (country === "IN") return region === "KL" ? "kerala" : "india";
  if (country && country in GULF) return "gulf";
  return "world";
}

/** Where the "Popular with travellers from …" line points: the city when known, else the state or country. */
function placeName(geo: Geo, segment: Segment) {
  if (geo.city) return geo.city;
  if (segment === "kerala") return "Kerala";
  if (segment === "india") return "across India";
  if (segment === "gulf") return GULF[geo.country!];
  return undefined;
}

export interface Recommendation {
  segment: Segment;
  title: string;
  items: { destination: Destination; days?: number }[];
}

export function recommend(geo: Geo): Recommendation {
  const segment = segmentFor(geo);
  const place = placeName(geo, segment);
  const items = PICKS[segment].flatMap((slug) => {
    const destination = getDestination(slug);
    if (!destination) return [];
    const days = getPackagesForDestination(slug).map((p) => p.durationDays);
    return [{ destination, days: days.length ? Math.min(...days) : undefined }];
  });
  const title = place ? `Popular with travellers from ${place}` : "Start with Kerala";
  return { segment, title, items };
}

/** City names arrive URL-encoded from some hosts; keep them short and plain before showing them. */
function cleanCity(raw: string | null) {
  if (!raw) return undefined;
  let city = raw;
  try { city = decodeURIComponent(raw); } catch { /* keep as sent */ }
  city = city.replace(/[^\p{L}\p{M} .'-]/gu, "").trim().slice(0, 40);
  return city || undefined;
}

/**
 * Reads the visitor's location from the host's headers (Vercel's x-vercel-ip-*, or Cloudflare's cf-* with visitor
 * location headers on). `override` ("AE", "IN-KL") previews another location, e.g. /?geo=IN-KL.
 */
export function geoFromHeaders(h: Headers, override?: string | null): Geo {
  const forced = override?.toUpperCase().match(/^([A-Z]{2})(?:-([A-Z0-9]{1,3}))?$/);
  if (forced) return { country: forced[1], region: forced[2] };
  const country = (h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? "").toUpperCase();
  const region = (h.get("x-vercel-ip-country-region") ?? h.get("cf-region-code") ?? "").toUpperCase();
  return {
    country: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : undefined,
    region: /^[A-Z0-9]{1,3}$/.test(region) ? region : undefined,
    city: cleanCity(h.get("x-vercel-ip-city") ?? h.get("cf-ipcity")),
  };
}
