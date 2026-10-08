// Downloads placeholder photography from Wikimedia Commons into public/images
// and writes public/images/CREDITS.md. Usage: node scripts/fetch-images.mjs [name...]
import fs from "node:fs";
import path from "node:path";

const UA = "PlumeriaHolidaysSite/0.1 (placeholder images; contact reservations@plumeriaholidays.com)";
const OUT = path.resolve("public/images");
const CREDITS = path.join(OUT, "credits.json");

export const queries = {
  "hero-backwaters": "Alappuzha backwaters houseboat",
  "hero-tea": "Munnar tea plantation hills",
  "hero-beach": "Kovalam beach",
  "hero-kochi": "Chinese fishing nets Fort Kochi sunset",
  munnar: "Munnar tea estate",
  alleppey: "Alleppey houseboat backwaters",
  kovalam: "Kovalam lighthouse beach",
  thekkady: "Periyar National Park lake",
  wayanad: "Wayanad landscape",
  kochi: "Fort Kochi beach fishing nets",
  goa: "Goa beach palm",
  andaman: "Radhanagar beach Havelock",
  kashmir: "Dal Lake shikara",
  rajasthan: "Taj Mahal",
  bali: "Bali rice terraces Tegallalang",
  maldives: "Maldives water villas",
  dubai: "Dubai skyline Burj Khalifa",
  thailand: "Phi Phi island Thailand",
  vietnam: "Ha Long Bay",
  europe: "Lucerne Chapel Bridge",
  "type-honeymoon": "Kerala houseboat sunset",
  "type-family": "Athirappilly waterfalls",
  "type-houseboat": "Kettuvallam Kerala houseboat",
  "type-adventure": "Chembra peak trek",
  "type-group": "Kathakali performance",
  "type-cruise": "cruise ship ocean",
  "memory-1": "Munnar morning mist",
  "memory-2": "Kerala sadya banana leaf",
  "memory-3": "Mattancherry Jew Town street",
  "memory-4": "Varkala cliff beach",
  "memory-5": "Kerala elephant festival",
  "memory-6": "Kumarakom backwaters",
  "memory-7": "Munnar Eravikulam",
  "memory-8": "Kerala canoe",
};

async function api(params) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ format: "json", origin: "*", ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  return r.json();
}

const strip = (s = "") => s.replace(/<[^>]+>/g, "").trim();

async function pick(query, used) {
  const j = await api({
    action: "query", generator: "search", gsrsearch: `${query} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "25",
    prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "2000",
  });
  const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || ii.mime !== "image/jpeg" || used.has(p.title)) continue;
    if (ii.width < 1800 || ii.width < ii.height * 1.2) continue;
    const m = ii.extmetadata ?? {};
    const lic = strip(m.LicenseShortName?.value);
    if (!/CC|Public domain|PD/i.test(lic)) continue;
    return { title: p.title, url: ii.thumburl, page: ii.descriptionurl, artist: strip(m.Artist?.value), license: lic };
  }
  return null;
}

const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, "utf8")) : {};
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(queries);
const used = new Set(Object.entries(credits).filter(([n]) => !names.includes(n)).map(([, c]) => c.title));
const skip = Object.fromEntries((process.env.SKIP ?? "").split(",").filter(Boolean).map((t) => [t, true]));

for (const name of names) {
  const c = await pick(queries[name], new Set([...used, ...Object.keys(skip)]));
  if (!c) { console.log(`MISS ${name}`); continue; }
  const r = await fetch(c.url, { headers: { "User-Agent": UA } });
  fs.writeFileSync(path.join(OUT, `${name}.jpg`), Buffer.from(await r.arrayBuffer()));
  used.add(c.title); credits[name] = c;
  console.log(`ok ${name} <- ${c.title}`);
}
fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 2));
const md = ["# Image credits", "", "Placeholder photography from Wikimedia Commons. Replace with Plumeria Holidays' own photos before launch.", ""]
  .concat(Object.entries(credits).map(([n, c]) => `- \`${n}.jpg\`: [${c.title}](${c.page}) by ${c.artist || "unknown"}, ${c.license}`));
fs.writeFileSync(path.join(OUT, "CREDITS.md"), md.join("\n") + "\n");
