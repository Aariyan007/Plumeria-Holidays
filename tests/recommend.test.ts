import { test, expect } from "vitest";
import { geoFromHeaders, recommend } from "@/lib/recommend";

const slugs = (r: ReturnType<typeof recommend>) => r.items.map((i) => i.destination.slug);

test("Kerala visitors get trips out of Kerala, not Kerala itself", () => {
  const r = recommend({ country: "IN", region: "KL", city: "Kochi" });
  expect(r.segment).toBe("kerala");
  expect(r.title).toBe("Popular with travellers from Kochi");
  expect(slugs(r)).not.toContain("alleppey");
  expect(slugs(r)[0]).toBe("kashmir");
});

test("rest of India and the Gulf lead with Kerala", () => {
  expect(slugs(recommend({ country: "IN", region: "MH" }))[0]).toBe("alleppey");
  const gulf = recommend({ country: "AE" });
  expect(gulf.segment).toBe("gulf");
  expect(gulf.title).toBe("Popular with travellers from the UAE");
  expect(slugs(gulf)[0]).toBe("alleppey");
});

test("unknown location falls back to Kerala highlights", () => {
  const r = recommend({});
  expect(r.segment).toBe("world");
  expect(r.title).toBe("Start with Kerala");
});

test("every pick is a real destination, six per segment", () => {
  for (const geo of [{ country: "IN", region: "KL" }, { country: "IN" }, { country: "QA" }, { country: "US" }])
    expect(recommend(geo).items).toHaveLength(6);
});

test("reads Vercel and Cloudflare headers, and the preview override", () => {
  const vercel = new Headers({ "x-vercel-ip-country": "IN", "x-vercel-ip-country-region": "KL", "x-vercel-ip-city": "Thiruvananthapuram" });
  expect(geoFromHeaders(vercel)).toEqual({ country: "IN", region: "KL", city: "Thiruvananthapuram" });
  expect(geoFromHeaders(new Headers({ "cf-ipcountry": "AE" })).country).toBe("AE");
  expect(geoFromHeaders(new Headers({ "cf-ipcountry": "XX" })).country).toBeUndefined(); // Cloudflare's "unknown"
  expect(geoFromHeaders(vercel, "in-mh")).toEqual({ country: "IN", region: "MH" });
  expect(geoFromHeaders(vercel, "<script>")).toMatchObject({ country: "IN" }); // bad override ignored
});

test("city names are decoded and stripped of anything but letters", () => {
  expect(geoFromHeaders(new Headers({ "x-vercel-ip-city": "S%C3%A3o%20Paulo" })).city).toBe("São Paulo");
  expect(geoFromHeaders(new Headers({ "x-vercel-ip-city": "<img src=x>" })).city).toBe("img srcx");
});
