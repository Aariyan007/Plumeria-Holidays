import { test, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import * as data from "@/lib/data";

test("getDestination returns undefined for unknown slug", () => {
  expect(data.getDestination("nope")).toBeUndefined();
  expect(data.getPackage("nope")).toBeUndefined();
});

test("region filter", () => {
  const intl = data.getDestinations("international");
  expect(intl.length).toBeGreaterThan(0);
  expect(intl.every((d) => d.region === "international")).toBe(true);
});

test("package filters combine region and type", () => {
  const p = data.getPackages({ region: "domestic", type: "honeymoon" });
  expect(p.length).toBeGreaterThan(0);
  expect(p.every((x) => x.region === "domestic" && x.holidayTypes.includes("honeymoon"))).toBe(true);
});

test("kerala destinations ordered for map", () => {
  const k = data.getKeralaDestinations().map((d) => d.slug);
  expect(k).toEqual(["wayanad", "kochi", "munnar", "alleppey", "thekkady", "kovalam"]);
});

test("slugs unique", () => {
  for (const list of [data.getDestinations(), data.getPackages()]) {
    const slugs = list.map((x) => x.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  }
});

test("every package references existing destinations", () => {
  for (const p of data.getPackages())
    for (const s of p.destinationSlugs) expect(data.getDestination(s), `${p.slug} -> ${s}`).toBeDefined();
});

test("every referenced image exists in public/", () => {
  const imgs = [
    ...data.getDestinations().map((d) => d.image),
    ...data.getPackages().map((p) => p.image),
    ...data.getHolidayTypes().map((h) => h.image),
    ...data.getMemories().map((m) => m.image),
    ...data.getHeroScenes().map((s) => s.image),
  ];
  for (const img of imgs) expect(fs.existsSync(path.join("public", img)), img).toBe(true);
});

test("every circuit has map data, a real package, and a note per stop", () => {
  for (const c of data.getCircuits()) {
    expect(c.map, c.id).toBeDefined();
    expect(data.getPackage(c.packageSlug), c.packageSlug).toBeDefined();
    expect(c.map.stops.length).toBeGreaterThan(2);
    for (const s of c.map.stops) expect(c.notes[s.slug], `${c.id}/${s.slug}`).toBeTruthy();
  }
});
