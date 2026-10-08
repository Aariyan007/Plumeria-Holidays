import { test, expect } from "vitest";
import { travelAgencyLd, tripLd } from "@/lib/seo";
import { getPackages } from "@/lib/data";
import sitemap from "@/app/sitemap";

test("agency ld", () => {
  const ld = travelAgencyLd() as Record<string, unknown>;
  expect(ld["@type"]).toBe("TravelAgency");
  expect(ld.telephone).toBe("+91 9048833330");
});
test("trip ld", () => {
  const p = getPackages()[0];
  const ld = tripLd(p) as Record<string, unknown>;
  expect(ld["@type"]).toBe("TouristTrip");
  expect(ld.name).toBe(p.title);
});
test("sitemap includes every destination and package", () => {
  const urls = sitemap().map((e) => e.url);
  expect(urls).toContain("https://www.plumeriaholidays.com/destinations/munnar");
  expect(urls.filter((u) => u.includes("/packages/")).length).toBe(getPackages().length);
});
