import { NextResponse } from "next/server";
import { geoFromHeaders, recommend } from "@/lib/recommend";

// Pages stay static and cached; only this small call varies by visitor, from the host's IP-location headers.
export async function GET(req: Request) {
  const geo = geoFromHeaders(req.headers, new URL(req.url).searchParams.get("geo"));
  const { segment, title, items } = recommend(geo);
  return NextResponse.json(
    {
      segment, title,
      items: items.map(({ destination: d, days }) => ({ slug: d.slug, name: d.name, tagline: d.tagline, image: d.image, days })),
    },
    // Per visitor: never let a shared cache hand one city's picks to everyone.
    { headers: { "Cache-Control": "private, max-age=600" } },
  );
}
