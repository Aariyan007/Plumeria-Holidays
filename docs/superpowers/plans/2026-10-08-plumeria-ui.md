# Plumeria Holidays UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the phase-1 (UI only) Plumeria Holidays website: server-rendered Next.js pages with GSAP motion, a WebGL hero, and typed local content.

**Architecture:** Next.js App Router with server components for all content and SEO. Animation lives in small client "islands" under `src/components/motion/`, all GSAP usage goes through `useGSAP`, and one `SmoothScroll` component wires Lenis to ScrollTrigger. Components read content only through `src/lib/data/` accessors, which is the seam for phase 2 (AI, CMS).

**Tech Stack:** Next.js (latest, App Router), TypeScript, Tailwind CSS v4, GSAP + `@gsap/react` (ScrollTrigger, SplitText, DrawSVGPlugin, Flip), Lenis, three.js + `@react-three/fiber` + `@react-three/drei`, zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-08-plumeria-ui-design.md`

## Global Constraints

- Lighthouse mobile on production build: Performance >= 85, Accessibility >= 95, SEO >= 95.
- `prefers-reduced-motion`: no preloader, no pinning, no petals, instant reveals.
- Animate only `transform` and `opacity`.
- three.js only in the hero, dynamically imported, `ssr: false`, DPR capped at 1.5, paused off-screen.
- Server HTML always contains all page copy and hero fallback images.
- Palette tokens: cream `#FBF6EC`, teal `#0F4C4A`, green `#1F7A63`, coral `#F2766B`, gold `#E8B04B`, ink `#142321`.
- Contact: phone `+91 9048833330`, email `reservations@plumeriaholidays.com`, WhatsApp `https://wa.me/919048833330`.
- Payment link goes to `https://www.plumeriaholidays.com/` payment page (external) for now.
- No "Privilege" page in phase 1.
- Commit after every task, messages ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Navigating between routes after scrolling the home page: ScrollTriggers from the old page must be killed and Lenis must reset to top; no stuck pin spacers. (Task 4 cleanup, verified in Task 14.)
2. Device without WebGL or with reduced motion: hero shows fallback images and all four scene captions, nothing blank. (Task 7 test for `canUseWebGL` and the fallback render.)
3. Unknown slug (`/destinations/xyz`, `/packages/xyz`): styled 404, not a crash. (Task 2 accessor test returns `undefined`; Task 8 and 10 call `notFound()`.)
4. Contact form with bad or spam input (empty name, invalid phone, honeypot filled): inline errors, no 500. (Task 3 tests.)
5. Content referencing an image file that does not exist: build should fail loudly, not ship broken images. (Task 2 test that every referenced image exists in `public/`.)

---

## File Structure

```
src/
  app/
    layout.tsx                 fonts, Header, Footer, SmoothScroll, Cursor, WhatsAppButton
    globals.css                Tailwind + tokens
    page.tsx                   home
    not-found.tsx
    sitemap.ts, robots.ts
    destinations/page.tsx, destinations/[slug]/page.tsx
    packages/page.tsx, packages/[slug]/page.tsx
    holiday-types/page.tsx
    about/page.tsx, memories/page.tsx, contact/page.tsx
    api/inquiry/route.ts
  components/
    ui/        Logo, Header, Footer, WhatsAppButton, Button, SectionHeading, PackageCard, JsonLd, ContactForm
    motion/    SmoothScroll, Cursor, Magnetic, SplitReveal, Preloader, HeroJourney, HeroCanvas,
               DestinationExplorer, KeralaMap, PackageFilter, Reveal
  lib/
    gsap.ts                    plugin registration (client only)
    motion.ts                  prefersReducedMotion(), canUseWebGL(), isLowEndDevice()
    inquiry.ts                 zod schema + validateInquiry()
    site.ts                    site constants (contact, nav)
    data/types.ts, data/index.ts
  content/
    destinations.ts, packages.ts, holidayTypes.ts, offices.ts, testimonials.ts, memories.ts
public/images/                 downloaded placeholder photography
tests/                         vitest
```

---

### Task 1: Scaffold project, tokens, fonts, test runner

**Files:**
- Create: project via create-next-app, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/site.ts`, `vitest.config.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Produces: `site` object from `src/lib/site.ts`; CSS tokens `--color-cream|teal|green|coral|gold|ink`, font variables `--font-display`, `--font-sans`; Tailwind classes `bg-cream text-ink font-display` etc.

- [ ] **Step 1: Scaffold into a temp dir and move in (repo already has `docs/`)**

```bash
cd /Users/lynux/Desktop/Plumeria
npx create-next-app@latest .scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
rsync -a .scaffold/ ./ --exclude .git && rm -rf .scaffold
npm i gsap @gsap/react lenis three @react-three/fiber @react-three/drei zod
npm i -D vitest @types/three
```

Then verify plugins ship in the public package:

```bash
ls node_modules/gsap/dist | grep -E "SplitText|DrawSVGPlugin|Flip"
```

Expected: `SplitText.min.js`, `DrawSVGPlugin.min.js`, `Flip.min.js` (plus non-min). If any is missing, stop and report.

- [ ] **Step 2: Write `src/lib/site.ts`**

```ts
export const site = {
  name: "Plumeria Holidays",
  url: "https://www.plumeriaholidays.com",
  tagline: "Journeys crafted in God's Own Country",
  phone: "+91 9048833330",
  email: "reservations@plumeriaholidays.com",
  whatsapp: "https://wa.me/919048833330",
  paymentUrl: "https://www.plumeriaholidays.com/",
  nav: [
    { href: "/destinations", label: "Destinations" },
    { href: "/packages", label: "Packages" },
    { href: "/holiday-types", label: "Holiday Types" },
    { href: "/memories", label: "Memories" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
```

- [ ] **Step 3: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-cream: #FBF6EC;
  --color-teal: #0F4C4A;
  --color-green: #1F7A63;
  --color-coral: #F2766B;
  --color-gold: #E8B04B;
  --color-ink: #142321;
  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans: var(--font-manrope), system-ui, sans-serif;
}

html { background: var(--color-cream); color: var(--color-ink); }
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
body { font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
::selection { background: var(--color-coral); color: var(--color-cream); }
:focus-visible { outline: 2px solid var(--color-coral); outline-offset: 3px; }
.petal-gradient { background: linear-gradient(135deg, #fff 0%, #F9E27D 45%, #F2766B 100%); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Replace `src/app/layout.tsx` (shell; Header etc. added in Task 5)**

```tsx
import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Kerala Tour Operator in Kochi`, template: `%s | ${site.name}` },
  description: "Tailor-made Kerala holidays, houseboats, and domestic and international tours from Kochi.",
  openGraph: { siteName: site.name, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Replace `src/app/page.tsx` with a placeholder heading: `export default function Home() { return <main className="p-10 font-display text-5xl text-teal">Plumeria</main>; }`

- [ ] **Step 5: Vitest config and smoke test**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

`tests/smoke.test.ts`:
```ts
import { site } from "@/lib/site";
import { test, expect } from "vitest";
test("site constants", () => {
  expect(site.whatsapp).toBe("https://wa.me/919048833330");
});
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 6: Verify**

Run: `npm test && npm run build`
Expected: 1 test passes; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js app with tokens, fonts, vitest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content types, seed content, data accessors, images

**Files:**
- Create: `src/lib/data/types.ts`, `src/lib/data/index.ts`, `src/content/*.ts`, `public/images/*`
- Test: `tests/data.test.ts`

**Interfaces:**
- Produces:
  - `type Region = "domestic" | "international"`
  - `type HolidayTypeSlug = "honeymoon" | "family" | "houseboat" | "adventure" | "group" | "cruise"`
  - `getDestinations(region?: Region): Destination[]`, `getDestination(slug: string): Destination | undefined`
  - `getKeralaDestinations(): Destination[]` (those with `map` set, ordered by `map.order`)
  - `getPackages(filter?: { region?: Region; type?: HolidayTypeSlug }): Package[]`, `getPackage(slug): Package | undefined`, `getFeaturedPackages(): Package[]`, `getPackagesForDestination(slug): Package[]`
  - `getHolidayTypes(): HolidayType[]`, `getOffices(): Office[]`, `getTestimonials(): Testimonial[]`, `getMemories(): Memory[]`, `getHeroScenes(): HeroScene[]`

- [ ] **Step 1: Write `src/lib/data/types.ts`**

```ts
export type Region = "domestic" | "international";
export type HolidayTypeSlug = "honeymoon" | "family" | "houseboat" | "adventure" | "group" | "cruise";

export interface Destination {
  slug: string; name: string; region: Region; tagline: string; story: string;
  highlights: string[]; bestTime: string; image: string;
  /** Kerala map placement in the 0-400 x 0-800 SVG viewBox; only Kerala destinations. */
  map?: { x: number; y: number; order: number };
}
export interface ItineraryDay { day: number; title: string; blurb: string }
export interface Package {
  slug: string; title: string; destinationSlugs: string[]; region: Region; durationDays: number;
  holidayTypes: HolidayTypeSlug[]; priceFrom?: number; summary: string;
  itinerary: ItineraryDay[]; inclusions: string[]; image: string; featured?: boolean;
  /** true when copy is placeholder pending client review */
  draft?: boolean;
}
export interface HolidayType { slug: HolidayTypeSlug; name: string; blurb: string; image: string }
export interface Office { city: string; role: "HQ" | "Branch" | "International"; contact: string }
export interface Testimonial { name: string; trip: string; quote: string }
export interface Memory { image: string; caption: string }
export interface HeroScene { id: string; kicker: string; title: string; image: string }
```

- [ ] **Step 2: Download placeholder photography**

Use WebSearch/WebFetch to find free-licensed Unsplash photos (Unsplash License) for each name below, then download each at width 2000 with `curl -L "https://images.unsplash.com/photo-<id>?w=2000&q=80&fm=jpg" -o public/images/<name>.jpg`. Record each source URL and photographer in `public/images/CREDITS.md`.

Required files: `hero-backwaters.jpg`, `hero-tea.jpg`, `hero-beach.jpg`, `hero-kochi.jpg`, `munnar.jpg`, `alleppey.jpg`, `kovalam.jpg`, `thekkady.jpg`, `wayanad.jpg`, `kochi.jpg`, `goa.jpg`, `andaman.jpg`, `kashmir.jpg`, `rajasthan.jpg`, `bali.jpg`, `maldives.jpg`, `dubai.jpg`, `thailand.jpg`, `vietnam.jpg`, `europe.jpg`, `type-honeymoon.jpg`, `type-family.jpg`, `type-houseboat.jpg`, `type-adventure.jpg`, `type-group.jpg`, `type-cruise.jpg`, `memory-1.jpg` … `memory-8.jpg`.

Run `ls public/images/*.jpg | wc -l` (expected: 34) and `file public/images/munnar.jpg` (expected: JPEG image data). Open 3 of them with the Read tool to confirm they depict the right place.

- [ ] **Step 3: Write content files**

`src/content/destinations.ts`:
```ts
import type { Destination } from "@/lib/data/types";

export const destinations: Destination[] = [
  { slug: "alleppey", name: "Alleppey", region: "domestic", tagline: "Drift through the backwaters",
    story: "Glide along palm-fringed canals on a traditional kettuvallam, past paddy fields, village jetties and slow Kerala afternoons.",
    highlights: ["Overnight houseboat cruise", "Village canoe ride", "Toddy-shop lunch", "Sunset on Vembanad Lake"],
    bestTime: "September to March", image: "/images/alleppey.jpg", map: { x: 128, y: 470, order: 3 } },
  { slug: "munnar", name: "Munnar", region: "domestic", tagline: "Mist, tea and mountain air",
    story: "Rolling tea estates climb into the clouds of the Western Ghats, with waterfalls, spice gardens and cool mornings.",
    highlights: ["Tea museum and estate walk", "Eravikulam National Park", "Mattupetty Dam", "Top Station viewpoint"],
    bestTime: "September to May", image: "/images/munnar.jpg", map: { x: 205, y: 395, order: 2 } },
  { slug: "thekkady", name: "Thekkady", region: "domestic", tagline: "Spice trails and wild elephants",
    story: "Cruise Periyar Lake at dawn for elephants and bison, then walk through cardamom and pepper plantations.",
    highlights: ["Periyar Lake boat safari", "Spice plantation tour", "Kathakali and Kalari shows", "Bamboo rafting"],
    bestTime: "October to June", image: "/images/thekkady.jpg", map: { x: 215, y: 520, order: 4 } },
  { slug: "kovalam", name: "Kovalam", region: "domestic", tagline: "Crescent beaches at land's end",
    story: "Lighthouse views, Ayurvedic retreats and warm Arabian Sea waters at the southern tip of Kerala.",
    highlights: ["Lighthouse Beach", "Ayurveda spa day", "Poovar estuary cruise", "Fresh seafood dinners"],
    bestTime: "October to March", image: "/images/kovalam.jpg", map: { x: 185, y: 700, order: 5 } },
  { slug: "kochi", name: "Kochi", region: "domestic", tagline: "Where the spice routes began",
    story: "Chinese fishing nets, colonial lanes, art cafes and the Biennale: Kerala's port city and our home.",
    highlights: ["Fort Kochi heritage walk", "Chinese fishing nets", "Mattancherry Palace", "Jew Town"],
    bestTime: "October to March", image: "/images/kochi.jpg", map: { x: 112, y: 420, order: 1 } },
  { slug: "wayanad", name: "Wayanad", region: "domestic", tagline: "Forests, caves and coffee",
    story: "Misty plateaus, ancient caves and plantation stays in Kerala's green north.",
    highlights: ["Edakkal Caves", "Chembra Peak trek", "Banasura Sagar Dam", "Plantation stay"],
    bestTime: "October to May", image: "/images/wayanad.jpg", map: { x: 120, y: 150, order: 0 } },
  { slug: "goa", name: "Goa", region: "domestic", tagline: "Sun, sand and Susegad", story: "Beaches, Portuguese churches and long lazy evenings.", highlights: ["North Goa beaches", "Old Goa churches", "Dudhsagar Falls"], bestTime: "November to February", image: "/images/goa.jpg" },
  { slug: "andaman", name: "Andaman", region: "domestic", tagline: "Turquoise island escapes", story: "Coral reefs, white sand and island hopping in the Bay of Bengal.", highlights: ["Radhanagar Beach", "Scuba at Havelock", "Cellular Jail"], bestTime: "October to May", image: "/images/andaman.jpg" },
  { slug: "kashmir", name: "Kashmir", region: "domestic", tagline: "Paradise on earth", story: "Shikaras on Dal Lake, meadows of Gulmarg and snow-capped Himalaya.", highlights: ["Dal Lake shikara", "Gulmarg gondola", "Pahalgam valleys"], bestTime: "March to October", image: "/images/kashmir.jpg" },
  { slug: "rajasthan", name: "Delhi, Agra & Jaipur", region: "domestic", tagline: "The Golden Triangle", story: "Forts, palaces and the Taj Mahal on India's classic circuit.", highlights: ["Taj Mahal", "Amber Fort", "Old Delhi food walk"], bestTime: "October to March", image: "/images/rajasthan.jpg" },
  { slug: "bali", name: "Bali", region: "international", tagline: "Temples and rice terraces", story: "Ubud's jungle, cliff temples and island sunsets.", highlights: ["Ubud rice terraces", "Uluwatu temple", "Nusa Penida"], bestTime: "April to October", image: "/images/bali.jpg" },
  { slug: "maldives", name: "Maldives", region: "international", tagline: "Overwater everything", story: "Private villas over lagoons and reefs you can snorkel from your deck.", highlights: ["Overwater villa", "Reef snorkelling", "Sandbank dinner"], bestTime: "November to April", image: "/images/maldives.jpg" },
  { slug: "dubai", name: "Dubai", region: "international", tagline: "Desert meets skyline", story: "Dunes, souks and the world's tallest tower.", highlights: ["Burj Khalifa", "Desert safari", "Dhow cruise"], bestTime: "November to March", image: "/images/dubai.jpg" },
  { slug: "thailand", name: "Thailand", region: "international", tagline: "Islands and street food", story: "Bangkok's energy and Phuket's beaches, with our own Bangkok office on hand.", highlights: ["Phi Phi islands", "Bangkok temples", "Floating markets"], bestTime: "November to April", image: "/images/thailand.jpg" },
  { slug: "vietnam", name: "Vietnam", region: "international", tagline: "Bays, lanterns and pho", story: "Ha Long Bay cruises and the lantern-lit streets of Hoi An.", highlights: ["Ha Long Bay", "Hoi An old town", "Hanoi street food"], bestTime: "February to April", image: "/images/vietnam.jpg" },
  { slug: "europe", name: "Europe", region: "international", tagline: "Grand tour, your way", story: "Paris, Swiss Alps and Italian cities on a guided group tour.", highlights: ["Eiffel Tower", "Jungfraujoch", "Venice gondola"], bestTime: "April to September", image: "/images/europe.jpg" },
];
```

`src/content/packages.ts` (all `draft: true`; pricing omitted until the client confirms):
```ts
import type { Package } from "@/lib/data/types";

export const packages: Package[] = [
  { slug: "kerala-classic-6d", title: "Kerala Classic", destinationSlugs: ["kochi", "munnar", "thekkady", "alleppey"], region: "domestic", durationDays: 6, holidayTypes: ["family", "honeymoon"], featured: true, draft: true,
    summary: "Kochi heritage, Munnar tea hills, Thekkady spice trails and a night on the backwaters.",
    itinerary: [
      { day: 1, title: "Arrive Kochi", blurb: "Fort Kochi walk and sunset at the fishing nets." },
      { day: 2, title: "Kochi to Munnar", blurb: "Drive up via Cheeyappara waterfalls." },
      { day: 3, title: "Munnar", blurb: "Eravikulam, tea museum and Mattupetty." },
      { day: 4, title: "Munnar to Thekkady", blurb: "Spice plantation tour and cultural show." },
      { day: 5, title: "Thekkady to Alleppey", blurb: "Board your private houseboat for an overnight cruise." },
      { day: 6, title: "Depart", blurb: "Disembark and transfer to Kochi airport." },
    ],
    inclusions: ["Hotels and houseboat", "Breakfast daily, all meals on houseboat", "Private AC car with driver", "Airport transfers"],
    image: "/images/munnar.jpg" },
  { slug: "backwater-honeymoon-4d", title: "Backwater Honeymoon", destinationSlugs: ["munnar", "alleppey"], region: "domestic", durationDays: 4, holidayTypes: ["honeymoon", "houseboat"], featured: true, draft: true,
    summary: "Two misty days in Munnar and a candlelit night on a private houseboat.",
    itinerary: [
      { day: 1, title: "Kochi to Munnar", blurb: "Check in to a valley-view resort." },
      { day: 2, title: "Munnar", blurb: "Top Station, tea estates and couple's spa." },
      { day: 3, title: "Alleppey houseboat", blurb: "Private cruise with candlelight dinner." },
      { day: 4, title: "Depart", blurb: "Transfer to Kochi." },
    ],
    inclusions: ["Honeymoon decor", "Private houseboat", "Breakfast and houseboat meals", "Private car"], image: "/images/alleppey.jpg" },
  { slug: "kerala-beaches-ayurveda-5d", title: "Beaches & Ayurveda", destinationSlugs: ["alleppey", "kovalam"], region: "domestic", durationDays: 5, holidayTypes: ["family"], draft: true,
    summary: "Backwaters followed by three slow days of beach and Ayurveda in Kovalam.",
    itinerary: [
      { day: 1, title: "Arrive Kochi, drive to Alleppey", blurb: "Lakeside resort and canoe ride." },
      { day: 2, title: "Alleppey to Kovalam", blurb: "Coastal drive south." },
      { day: 3, title: "Kovalam", blurb: "Lighthouse Beach and Ayurveda session." },
      { day: 4, title: "Poovar", blurb: "Estuary cruise to the golden sand bar." },
      { day: 5, title: "Depart", blurb: "Transfer to Trivandrum airport." },
    ],
    inclusions: ["Hotels", "Breakfast daily", "One Ayurveda session", "Private car"], image: "/images/kovalam.jpg" },
  { slug: "kashmir-paradise-6d", title: "Kashmir Paradise", destinationSlugs: ["kashmir"], region: "domestic", durationDays: 6, holidayTypes: ["family", "honeymoon"], featured: true, draft: true,
    summary: "Houseboat on Dal Lake, Gulmarg meadows and Pahalgam valleys.",
    itinerary: [
      { day: 1, title: "Arrive Srinagar", blurb: "Shikara ride and houseboat stay." },
      { day: 2, title: "Gulmarg", blurb: "Gondola ride." },
      { day: 3, title: "Pahalgam", blurb: "Betaab and Aru valleys." },
      { day: 4, title: "Sonamarg", blurb: "Thajiwas glacier." },
      { day: 5, title: "Srinagar", blurb: "Mughal gardens." },
      { day: 6, title: "Depart", blurb: "Airport transfer." },
    ],
    inclusions: ["Hotels and houseboat", "Breakfast and dinner", "Private car"], image: "/images/kashmir.jpg" },
  { slug: "andaman-islands-5d", title: "Andaman Island Hop", destinationSlugs: ["andaman"], region: "domestic", durationDays: 5, holidayTypes: ["adventure", "family"], draft: true,
    summary: "Port Blair history, Havelock beaches and a first dive.",
    itinerary: [
      { day: 1, title: "Port Blair", blurb: "Cellular Jail light and sound show." },
      { day: 2, title: "Havelock", blurb: "Ferry and Radhanagar sunset." },
      { day: 3, title: "Havelock", blurb: "Try scuba at Elephant Beach." },
      { day: 4, title: "Neil Island", blurb: "Natural bridge and Bharatpur beach." },
      { day: 5, title: "Depart", blurb: "Return ferry and flight." },
    ],
    inclusions: ["Hotels", "Ferries", "Breakfast", "Transfers"], image: "/images/andaman.jpg" },
  { slug: "bali-escape-6d", title: "Bali Escape", destinationSlugs: ["bali"], region: "international", durationDays: 6, holidayTypes: ["honeymoon", "adventure"], featured: true, draft: true,
    summary: "Ubud jungle villas, Kintamani volcano and Nusa Penida cliffs.",
    itinerary: [
      { day: 1, title: "Arrive Bali", blurb: "Seminyak sunset." },
      { day: 2, title: "Ubud", blurb: "Rice terraces and swing." },
      { day: 3, title: "Kintamani", blurb: "Volcano views and coffee plantation." },
      { day: 4, title: "Nusa Penida", blurb: "Kelingking and Broken Beach." },
      { day: 5, title: "Uluwatu", blurb: "Temple and Kecak dance." },
      { day: 6, title: "Depart", blurb: "Airport transfer." },
    ],
    inclusions: ["Hotels", "Breakfast", "Tours with guide", "Transfers"], image: "/images/bali.jpg" },
  { slug: "maldives-overwater-4d", title: "Maldives Overwater", destinationSlugs: ["maldives"], region: "international", durationDays: 4, holidayTypes: ["honeymoon"], featured: true, draft: true,
    summary: "Three nights in an overwater villa with reef snorkelling.",
    itinerary: [
      { day: 1, title: "Arrive Male", blurb: "Speedboat to resort." },
      { day: 2, title: "Reef day", blurb: "Snorkel and sandbank picnic." },
      { day: 3, title: "At leisure", blurb: "Spa and sunset dolphin cruise." },
      { day: 4, title: "Depart", blurb: "Transfer to Male." },
    ],
    inclusions: ["Overwater villa", "Half board", "Speedboat transfers"], image: "/images/maldives.jpg" },
  { slug: "dubai-highlights-5d", title: "Dubai Highlights", destinationSlugs: ["dubai"], region: "international", durationDays: 5, holidayTypes: ["family", "group"], draft: true,
    summary: "Burj Khalifa, desert safari and a dhow cruise dinner.",
    itinerary: [
      { day: 1, title: "Arrive Dubai", blurb: "Dhow cruise dinner." },
      { day: 2, title: "City tour", blurb: "Burj Khalifa and Dubai Mall." },
      { day: 3, title: "Desert safari", blurb: "Dune bashing and BBQ camp." },
      { day: 4, title: "Abu Dhabi", blurb: "Grand Mosque day trip." },
      { day: 5, title: "Depart", blurb: "Airport transfer." },
    ],
    inclusions: ["Hotel", "Breakfast", "Tours", "Visa assistance"], image: "/images/dubai.jpg" },
  { slug: "thailand-group-6d", title: "Thailand Group Tour", destinationSlugs: ["thailand"], region: "international", durationDays: 6, holidayTypes: ["group"], featured: true, draft: true,
    summary: "Bangkok and Pattaya with our Bangkok team on the ground.",
    itinerary: [
      { day: 1, title: "Arrive Bangkok", blurb: "Transfer to Pattaya." },
      { day: 2, title: "Coral Island", blurb: "Speedboat and beach." },
      { day: 3, title: "Pattaya", blurb: "Nong Nooch garden." },
      { day: 4, title: "Bangkok", blurb: "Temples and river cruise." },
      { day: 5, title: "Safari World", blurb: "Marine park." },
      { day: 6, title: "Depart", blurb: "Airport transfer." },
    ],
    inclusions: ["Hotels", "Breakfast", "Indian meals", "Tour manager"], image: "/images/thailand.jpg" },
  { slug: "vietnam-discovery-7d", title: "Vietnam Discovery", destinationSlugs: ["vietnam"], region: "international", durationDays: 7, holidayTypes: ["cruise", "adventure"], draft: true,
    summary: "Hanoi, an overnight Ha Long Bay cruise and lantern-lit Hoi An.",
    itinerary: [
      { day: 1, title: "Hanoi", blurb: "Old Quarter food walk." },
      { day: 2, title: "Ha Long Bay", blurb: "Board overnight cruise." },
      { day: 3, title: "Ha Long Bay", blurb: "Kayaking and caves, return to Hanoi." },
      { day: 4, title: "Fly to Da Nang", blurb: "Ba Na Hills Golden Bridge." },
      { day: 5, title: "Hoi An", blurb: "Lantern night market." },
      { day: 6, title: "My Son", blurb: "Ancient Cham temples." },
      { day: 7, title: "Depart", blurb: "Airport transfer." },
    ],
    inclusions: ["Hotels and cruise", "Breakfast", "Domestic flight", "Guided tours"], image: "/images/vietnam.jpg" },
  { slug: "europe-grand-tour-10d", title: "Europe Grand Tour", destinationSlugs: ["europe"], region: "international", durationDays: 10, holidayTypes: ["group", "family"], draft: true,
    summary: "Paris, Switzerland and Italy with an escorted group.",
    itinerary: [
      { day: 1, title: "Paris", blurb: "Arrival and Seine cruise." },
      { day: 2, title: "Paris", blurb: "Eiffel Tower and Louvre." },
      { day: 3, title: "To Switzerland", blurb: "Drive to Lucerne." },
      { day: 4, title: "Jungfraujoch", blurb: "Top of Europe." },
      { day: 5, title: "Lucerne", blurb: "Mt Titlis." },
      { day: 6, title: "To Venice", blurb: "Gondola ride." },
      { day: 7, title: "Florence and Pisa", blurb: "Leaning tower." },
      { day: 8, title: "Rome", blurb: "Colosseum." },
      { day: 9, title: "Vatican", blurb: "St Peter's Basilica." },
      { day: 10, title: "Depart", blurb: "Fly home." },
    ],
    inclusions: ["Hotels", "Breakfast and Indian dinners", "Coach travel", "Tour manager", "Visa assistance"], image: "/images/europe.jpg" },
  { slug: "kerala-houseboat-2d", title: "Houseboat Getaway", destinationSlugs: ["alleppey"], region: "domestic", durationDays: 2, holidayTypes: ["houseboat", "family", "cruise"], draft: true,
    summary: "A one-night private kettuvallam cruise on Vembanad Lake.",
    itinerary: [
      { day: 1, title: "Board at noon", blurb: "Cruise with Kerala lunch, tea and dinner on board." },
      { day: 2, title: "Disembark", blurb: "Breakfast and checkout by 9am." },
    ],
    inclusions: ["Private houseboat", "All meals on board", "Transfers from Kochi"], image: "/images/type-houseboat.jpg" },
];
```

`src/content/holidayTypes.ts`:
```ts
import type { HolidayType } from "@/lib/data/types";
export const holidayTypes: HolidayType[] = [
  { slug: "honeymoon", name: "Honeymoon", blurb: "Private houseboats, hill-view suites and candlelit dinners.", image: "/images/type-honeymoon.jpg" },
  { slug: "family", name: "Family", blurb: "Easy pacing, kid-friendly stays and a driver who knows the way.", image: "/images/type-family.jpg" },
  { slug: "houseboat", name: "Houseboat", blurb: "Kettuvallam cruises through Alleppey and Kumarakom.", image: "/images/type-houseboat.jpg" },
  { slug: "adventure", name: "Adventure", blurb: "Treks, dives, rafting and jungle nights.", image: "/images/type-adventure.jpg" },
  { slug: "group", name: "Group Tours", blurb: "Escorted departures with Indian meals and a tour manager.", image: "/images/type-group.jpg" },
  { slug: "cruise", name: "Cruise", blurb: "Ocean liners, river cruises and Ha Long Bay junks.", image: "/images/type-cruise.jpg" },
];
```

`src/content/offices.ts`:
```ts
import type { Office } from "@/lib/data/types";
export const offices: Office[] = [
  { city: "Kochi", role: "HQ", contact: "+91 9048833330" },
  { city: "Bangalore", role: "Branch", contact: "+91 9048833330" },
  { city: "Mumbai", role: "Branch", contact: "+91 9048833330" },
  { city: "Coimbatore", role: "Branch", contact: "+91 9048833330" },
  { city: "Chennai", role: "Branch", contact: "+91 9048833330" },
  { city: "Ahmedabad", role: "Branch", contact: "+91 9048833330" },
  { city: "Bangkok", role: "International", contact: "+91 9048833330" },
];
```

`src/content/testimonials.ts` (placeholder, flagged for replacement with real reviews):
```ts
import type { Testimonial } from "@/lib/data/types";
// PLACEHOLDER: replace with real client reviews before launch.
export const testimonials: Testimonial[] = [
  { name: "Anjali & Rahul", trip: "Backwater Honeymoon", quote: "The houseboat night was pure magic. Every detail was taken care of." },
  { name: "The Mathew family", trip: "Kerala Classic", quote: "Our driver felt like family by day two. The kids still talk about the elephants." },
  { name: "Suresh K.", trip: "Thailand Group Tour", quote: "Smooth from visa to return flight. The Bangkok team was brilliant." },
];
```

`src/content/memories.ts`:
```ts
import type { Memory } from "@/lib/data/types";
export const memories: Memory[] = Array.from({ length: 8 }, (_, i) => ({
  image: `/images/memory-${i + 1}.jpg`,
  caption: ["Sunrise in Munnar", "Houseboat lunch", "Fort Kochi nets", "Kovalam evening", "Periyar safari", "Bali terraces", "Dal Lake shikara", "Maldives lagoon"][i],
}));
```

`src/content/heroScenes.ts`:
```ts
import type { HeroScene } from "@/lib/data/types";
export const heroScenes: HeroScene[] = [
  { id: "backwaters", kicker: "Alleppey", title: "Drift where the water slows time", image: "/images/hero-backwaters.jpg" },
  { id: "tea", kicker: "Munnar", title: "Climb into the clouds of tea", image: "/images/hero-tea.jpg" },
  { id: "beach", kicker: "Kovalam", title: "Follow the coast to land's end", image: "/images/hero-beach.jpg" },
  { id: "kochi", kicker: "Kochi", title: "Begin where the spice routes began", image: "/images/hero-kochi.jpg" },
];
```

- [ ] **Step 4: Write the failing tests `tests/data.test.ts`**

```ts
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
```

- [ ] **Step 5: Run to verify fail**

Run: `npm test`
Expected: FAIL, cannot resolve `@/lib/data`.

- [ ] **Step 6: Implement `src/lib/data/index.ts`**

```ts
import { destinations } from "@/content/destinations";
import { packages } from "@/content/packages";
import { holidayTypes } from "@/content/holidayTypes";
import { offices } from "@/content/offices";
import { testimonials } from "@/content/testimonials";
import { memories } from "@/content/memories";
import { heroScenes } from "@/content/heroScenes";
import type { HolidayTypeSlug, Region } from "./types";

export * from "./types";

export const getDestinations = (region?: Region) =>
  region ? destinations.filter((d) => d.region === region) : destinations;
export const getDestination = (slug: string) => destinations.find((d) => d.slug === slug);
export const getKeralaDestinations = () =>
  destinations.filter((d) => d.map).sort((a, b) => a.map!.order - b.map!.order);

export const getPackages = (filter: { region?: Region; type?: HolidayTypeSlug } = {}) =>
  packages.filter(
    (p) => (!filter.region || p.region === filter.region) && (!filter.type || p.holidayTypes.includes(filter.type)),
  );
export const getPackage = (slug: string) => packages.find((p) => p.slug === slug);
export const getFeaturedPackages = () => packages.filter((p) => p.featured);
export const getPackagesForDestination = (slug: string) => packages.filter((p) => p.destinationSlugs.includes(slug));

export const getHolidayTypes = () => holidayTypes;
export const getOffices = () => offices;
export const getTestimonials = () => testimonials;
export const getMemories = () => memories;
export const getHeroScenes = () => heroScenes;
```

- [ ] **Step 7: Run to verify pass**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: content model, seed content, data accessors, placeholder images

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Inquiry validation and route handler

**Files:**
- Create: `src/lib/inquiry.ts`, `src/app/api/inquiry/route.ts`
- Test: `tests/inquiry.test.ts`

**Interfaces:**
- Produces: `inquirySchema`, `type Inquiry`, `validateInquiry(input: unknown): { ok: true; data: Inquiry } | { ok: false; errors: Record<string, string> }`. `POST /api/inquiry` returns `200 {ok:true}` or `400 {ok:false, errors}`.

- [ ] **Step 1: Write failing tests `tests/inquiry.test.ts`**

```ts
import { test, expect } from "vitest";
import { validateInquiry } from "@/lib/inquiry";

const good = { name: "Asha", phone: "+91 98765 43210", email: "asha@example.com", message: "Honeymoon in Dec", website: "" };

test("accepts valid input", () => {
  expect(validateInquiry(good).ok).toBe(true);
});
test("email optional", () => {
  expect(validateInquiry({ ...good, email: "" }).ok).toBe(true);
});
test("rejects empty name and bad phone with field errors", () => {
  const r = validateInquiry({ ...good, name: " ", phone: "abc" });
  expect(r.ok).toBe(false);
  if (!r.ok) { expect(r.errors.name).toBeDefined(); expect(r.errors.phone).toBeDefined(); }
});
test("rejects filled honeypot", () => {
  const r = validateInquiry({ ...good, website: "http://spam" });
  expect(r.ok).toBe(false);
});
test("rejects non-object", () => {
  expect(validateInquiry(null).ok).toBe(false);
  expect(validateInquiry("x").ok).toBe(false);
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test -- inquiry`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/lib/inquiry.ts`**

```ts
import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
  message: z.string().trim().max(2000).optional(),
  packageSlug: z.string().optional(),
  website: z.string().max(0, "Spam detected").optional(), // honeypot
});
export type Inquiry = z.infer<typeof inquirySchema>;

export function validateInquiry(input: unknown):
  | { ok: true; data: Inquiry }
  | { ok: false; errors: Record<string, string> } {
  const r = inquirySchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
  return { ok: false, errors };
}
```

- [ ] **Step 4: Implement `src/app/api/inquiry/route.ts`**

```ts
import { NextResponse } from "next/server";
import { validateInquiry } from "@/lib/inquiry";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const r = validateInquiry(body);
  if (!r.ok) return NextResponse.json(r, { status: 400 });
  // Phase 2: deliver by email / CRM and lead scoring. For now, log server-side.
  console.info("[inquiry]", { name: r.data.name, packageSlug: r.data.packageSlug });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: inquiry validation and API route

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Motion foundation (GSAP registration, Lenis, helpers, cursor, magnetic, reveals)

**Files:**
- Create: `src/lib/gsap.ts`, `src/lib/motion.ts`, `src/components/motion/SmoothScroll.tsx`, `Cursor.tsx`, `Magnetic.tsx`, `SplitReveal.tsx`, `Reveal.tsx`
- Test: `tests/motion.test.ts`

**Interfaces:**
- Produces:
  - `import { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip, useGSAP } from "@/lib/gsap"` (client only)
  - `prefersReducedMotion(): boolean`, `canUseWebGL(doc?: Document): boolean`, `isLowEndDevice(nav?: Navigator): boolean`
  - `<SmoothScroll />` (no children; mounts Lenis, resets scroll and refreshes ScrollTrigger on pathname change)
  - `<Cursor />`, `<Magnetic strength?: number>{children}</Magnetic>`, `<SplitReveal as?: "h1"|"h2"|"p" className? >text</SplitReveal>`, `<Reveal className? delay?>{children}</Reveal>`

- [ ] **Step 1: Write failing tests `tests/motion.test.ts`**

```ts
import { test, expect } from "vitest";
import { canUseWebGL, isLowEndDevice } from "@/lib/motion";

test("canUseWebGL false when no context", () => {
  const doc = { createElement: () => ({ getContext: () => null }) } as unknown as Document;
  expect(canUseWebGL(doc)).toBe(false);
});
test("canUseWebGL true when webgl2 context", () => {
  const doc = { createElement: () => ({ getContext: (k: string) => (k === "webgl2" ? {} : null) }) } as unknown as Document;
  expect(canUseWebGL(doc)).toBe(true);
});
test("canUseWebGL false on throw", () => {
  const doc = { createElement: () => { throw new Error("x"); } } as unknown as Document;
  expect(canUseWebGL(doc)).toBe(false);
});
test("isLowEndDevice", () => {
  expect(isLowEndDevice({ hardwareConcurrency: 2, deviceMemory: 2 } as unknown as Navigator)).toBe(true);
  expect(isLowEndDevice({ hardwareConcurrency: 8, deviceMemory: 8 } as unknown as Navigator)).toBe(false);
  expect(isLowEndDevice({ hardwareConcurrency: 8 } as unknown as Navigator)).toBe(false);
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test -- motion` → FAIL, module not found.

- [ ] **Step 3: Implement `src/lib/motion.ts`**

```ts
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function canUseWebGL(doc: Document = document): boolean {
  try {
    const c = doc.createElement("canvas") as HTMLCanvasElement;
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function isLowEndDevice(nav: Navigator = navigator): boolean {
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = (nav as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 && mem <= 4;
}
```

Run: `npm test -- motion` → PASS.

- [ ] **Step 4: `src/lib/gsap.ts`**

```ts
"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, useGSAP);

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip, useGSAP };
```

- [ ] **Step 5: `src/components/motion/SmoothScroll.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; };
  }, []);

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    if (!lenis) window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => { cancelAnimationFrame(id); window.removeEventListener("load", onLoad); };
  }, [pathname]);

  return null;
}
```

- [ ] **Step 6: `src/components/motion/Cursor.tsx`**

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const el = dot.current!;
    el.style.display = "block";
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY);
      const hot = (e.target as HTMLElement).closest("a,button,[data-cursor]");
      gsap.to(el, { scale: hot ? 2.6 : 1, duration: 0.3 });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  });
  return (
    <div ref={dot} aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral mix-blend-multiply" />
  );
}
```

- [ ] **Step 7: `src/components/motion/Magnetic.tsx`**

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1,0.4)" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1,0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { x(0); y(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  });
  return <span ref={ref} className="inline-block">{children}</span>;
}
```

- [ ] **Step 8: `src/components/motion/SplitReveal.tsx` and `Reveal.tsx`**

```tsx
"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p";
export function SplitReveal({ as = "h2", className, children, immediate = false }:
  { as?: Tag; className?: string; children: string; immediate?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Comp = as;
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const split = SplitText.create(ref.current!, { type: "lines,words", mask: "lines", autoSplit: true,
      onSplit: (self) => gsap.from(self.words, {
        yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.04,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 85%" },
      }),
    });
    return () => split.revert();
  }, { scope: ref });
  return <Comp ref={ref} className={className}>{children}</Comp>;
}
```

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from(ref.current!.children, { y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay,
      scrollTrigger: { trigger: ref.current, start: "top 85%" } });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}
```

- [ ] **Step 9: Verify build**

Run: `npm test && npm run build`
Expected: PASS, build succeeds (components unused yet is fine).

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: motion foundation (gsap, lenis, cursor, magnetic, reveals)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Layout shell (logo, header, footer, WhatsApp, buttons)

**Files:**
- Create: `src/components/ui/Logo.tsx`, `Header.tsx`, `Footer.tsx`, `WhatsAppButton.tsx`, `Button.tsx`, `SectionHeading.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `site`, `Magnetic`, `SmoothScroll`, `Cursor`.
- Produces: `<Logo className? />` (SVG 5-petal plumeria, `currentColor` stroke, gradient fill), `<Button href variant?: "primary"|"ghost">`, `<SectionHeading kicker title intro? />`.

- [ ] **Step 1: `Logo.tsx`**

```tsx
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="petal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F9E27D" />
          <stop offset="55%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F2766B" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} d="M50 50 C 38 30, 42 8, 58 6 C 72 6, 68 32, 50 50 Z"
          fill="url(#petal)" stroke="currentColor" strokeWidth="1.5" transform={`rotate(${r} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="5" fill="#E8B04B" />
    </svg>
  );
}
```

- [ ] **Step 2: `Button.tsx` and `SectionHeading.tsx`**

```tsx
import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";

export function Button({ href, children, variant = "primary", external = false }:
  { href: string; children: React.ReactNode; variant?: "primary" | "ghost"; external?: boolean }) {
  const cls = variant === "primary"
    ? "bg-coral text-cream hover:bg-teal"
    : "border border-current hover:bg-ink hover:text-cream";
  const props = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Magnetic>
      <Link href={href} {...props}
        className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors ${cls}`}>
        {children}
      </Link>
    </Magnetic>
  );
}
```

```tsx
import { SplitReveal } from "@/components/motion/SplitReveal";
export function SectionHeading({ kicker, title, intro, light = false }:
  { kicker: string; title: string; intro?: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-gold" : "text-coral"}`}>{kicker}</p>
      <SplitReveal className="font-display text-4xl leading-[1.05] md:text-6xl">{title}</SplitReveal>
      {intro && <p className={`mt-6 text-lg ${light ? "text-cream/80" : "text-ink/70"}`}>{intro}</p>}
    </div>
  );
}
```

- [ ] **Step 3: `Header.tsx` (client: hides on scroll down, mobile menu)**

```tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { Button } from "./Button";

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => { const y = window.scrollY; setHidden(y > last && y > 120); last = y; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ${hidden && !open ? "-translate-y-full" : ""}`}>
      <div className="mx-4 mt-4 flex items-center justify-between rounded-full bg-cream/80 px-5 py-2.5 shadow-sm backdrop-blur-md md:mx-8">
        <Link href="/" className="flex items-center gap-2 text-teal" aria-label="Plumeria Holidays home">
          <Logo /> <span className="font-display text-lg">Plumeria</span>
        </Link>
        <nav className="hidden gap-7 text-sm lg:flex" aria-label="Main">
          {site.nav.map((n) => (
            <Link key={n.href} href={n.href} className={`hover:text-coral ${pathname.startsWith(n.href) ? "text-coral" : ""}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="hidden lg:block"><Button href="/contact">Plan my trip</Button></div>
        <button className="lg:hidden p-2" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
          <span className="sr-only">Menu</span>
          <span className="block h-0.5 w-6 bg-ink" /><span className="mt-1.5 block h-0.5 w-6 bg-ink" />
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="mx-4 mt-2 rounded-3xl bg-teal p-8 text-cream lg:hidden" aria-label="Mobile">
          {site.nav.map((n) => <Link key={n.href} href={n.href} className="block py-2 font-display text-3xl">{n.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 4: `Footer.tsx` and `WhatsAppButton.tsx`**

```tsx
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
          <h3 className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">Explore</h3>
          {site.nav.map((n) => <Link key={n.href} href={n.href} className="block py-1 text-cream/80 hover:text-coral">{n.label}</Link>)}
          <a href={site.paymentUrl} target="_blank" rel="noopener noreferrer" className="block py-1 text-cream/80 hover:text-coral">Make a payment</a>
        </div>
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">Talk to us</h3>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="block py-1">{site.phone}</a>
          <a href={`mailto:${site.email}`} className="block py-1 break-all">{site.email}</a>
          <p className="mt-4 text-sm text-cream/60">{getOffices().map((o) => o.city).join(" · ")}</p>
        </div>
      </div>
      <p className="mt-16 text-xs text-cream/50">© {new Date().getFullYear()} Plumeria Holidays. All rights reserved.</p>
    </footer>
  );
}
```

```tsx
import { site } from "@/lib/site";
export function WhatsAppButton() {
  return (
    <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green text-cream shadow-lg transition-transform hover:scale-110">
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" />
      </svg>
    </a>
  );
}
```

- [ ] **Step 5: Wire into `src/app/layout.tsx` body**

```tsx
// add imports
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
// body:
<body>
  <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-cream focus:p-3">Skip to content</a>
  <SmoothScroll />
  <Cursor />
  <Header />
  <div id="main">{children}</div>
  <Footer />
  <WhatsAppButton />
</body>
```

- [ ] **Step 6: Verify**

Run: `npm run build && npm run dev`, open `http://localhost:3000` in the browser at 1440px and 390px widths. Expected: header pill, nav works, mobile menu toggles, footer and WhatsApp button visible, coral cursor dot follows mouse on desktop only.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: layout shell with header, footer, logo, WhatsApp

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Petal preloader

**Files:**
- Create: `src/components/motion/Preloader.tsx`
- Modify: `src/app/layout.tsx` (render `<Preloader />` first in body)

**Interfaces:**
- Consumes: `gsap`, `useGSAP`, `prefersReducedMotion`.
- Produces: `<Preloader />`; sets `sessionStorage["plumeria-preloaded"]="1"`; dispatches `window` event `"preloader:done"` when finished (HeroJourney listens to start its intro).

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const KEY = "plumeria-preloaded";

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(() => {
    const done = () => { setGone(true); window.dispatchEvent(new Event("preloader:done")); };
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch {}
    if (seen || prefersReducedMotion()) return done();
    try { sessionStorage.setItem(KEY, "1"); } catch {}

    const tl = gsap.timeline({ onComplete: done });
    tl.from(".pl-petal", { scale: 0, rotate: -90, transformOrigin: "50px 50px", duration: 1, ease: "back.out(1.6)", stagger: 0.09 })
      .from(".pl-core", { scale: 0, transformOrigin: "50% 50%", duration: 0.4 }, "-=0.4")
      .from(".pl-word", { yPercent: 100, duration: 0.7, ease: "expo.out" }, "-=0.3")
      .to(".pl-flower", { rotate: 72, scale: 14, opacity: 0, duration: 1.1, ease: "expo.in", transformOrigin: "50% 50%" }, "+=0.3")
      .to(root.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.5");
    // Safety: never block more than 4.5s.
    const t = setTimeout(() => tl.progress(1), 4500);
    return () => clearTimeout(t);
  }, { scope: root });

  if (gone) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-teal text-cream" aria-hidden>
      <svg viewBox="0 0 100 100" className="pl-flower h-28 w-28">
        {[0, 72, 144, 216, 288].map((r) => (
          <path key={r} className="pl-petal" d="M50 50 C 38 30, 42 8, 58 6 C 72 6, 68 32, 50 50 Z"
            fill="#FBF6EC" stroke="#F2766B" strokeWidth="1" transform={`rotate(${r} 50 50)`} />
        ))}
        <circle className="pl-core" cx="50" cy="50" r="6" fill="#E8B04B" />
      </svg>
      <div className="mt-6 overflow-hidden"><p className="pl-word font-display text-2xl tracking-wide">Plumeria Holidays</p></div>
    </div>
  );
}
```

- [ ] **Step 2: Add `<Preloader />` as first child of `<body>` in layout (import from `@/components/motion/Preloader`).**

- [ ] **Step 3: Verify in browser**

Open `/` in a fresh tab: flower blooms, scales out, overlay lifts within about 3.5s. Reload: no preloader (session). View source (`curl -s localhost:3000 | grep -c "Plumeria"`): page copy present in HTML. Emulate reduced motion in DevTools: no preloader.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: plumeria bloom preloader

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Hero journey with WebGL scenes and petals

**Files:**
- Create: `src/components/motion/HeroJourney.tsx` (client, owns pinning + captions + fallback), `src/components/motion/HeroCanvas.tsx` (three.js, dynamically imported), `src/components/motion/heroShaders.ts`
- Modify: `src/app/page.tsx`
- Test: covered by `tests/motion.test.ts` (`canUseWebGL`) plus browser verification

**Interfaces:**
- Consumes: `HeroScene[]` from `getHeroScenes()`, `gsap`, `ScrollTrigger`, `SplitText`, `canUseWebGL`, `isLowEndDevice`, `prefersReducedMotion`.
- Produces: `<HeroJourney scenes={HeroScene[]} />`. `HeroCanvas` props: `{ images: string[]; progress: React.MutableRefObject<number>; active: React.MutableRefObject<boolean>; petals: number }`. `progress.current` ranges 0..(images.length-1).

- [ ] **Step 1: `heroShaders.ts`**

```ts
export const vertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const fragment = /* glsl */ `
uniform sampler2D uFrom; uniform sampler2D uTo;
uniform float uMix; uniform float uTime; uniform float uWater;
uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uMouse;
varying vec2 vUv;

vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
float noise(vec2 p) { return sin(p.x * 10.0 + uTime) * sin(p.y * 12.0 + uTime * 1.3); }

void main() {
  vec2 uv = cover(vUv);
  // water ripple, stronger on lower half
  float w = uWater * smoothstep(0.55, 0.0, vUv.y) * 0.006;
  vec2 ripple = vec2(noise(uv * 3.0), noise(uv * 3.0 + 7.0)) * w;
  // mouse lens
  float d = distance(vUv, uMouse);
  vec2 lens = (vUv - uMouse) * 0.03 * smoothstep(0.25, 0.0, d);
  // displacement crossfade
  float n = noise(uv * 2.0) * 0.5 + 0.5;
  float m = smoothstep(n - 0.2, n + 0.2, uMix * 1.4 - 0.2);
  vec4 a = texture2D(uFrom, uv + ripple + lens + vec2(0.0, m * 0.08));
  vec4 b = texture2D(uTo, uv + ripple + lens - vec2(0.0, (1.0 - m) * 0.08));
  gl_FragColor = mix(a, b, m);
}`;
```

- [ ] **Step 2: `HeroCanvas.tsx`**

```tsx
"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { vertex, fragment } from "./heroShaders";

type Props = { images: string[]; progress: React.MutableRefObject<number>; active: React.MutableRefObject<boolean>; petals: number };

function ScenePlane({ images, progress }: Pick<Props, "images" | "progress">) {
  const textures = useTexture(images);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const uniforms = useMemo(() => ({
    uFrom: { value: textures[0] }, uTo: { value: textures[1] ?? textures[0] },
    uMix: { value: 0 }, uTime: { value: 0 }, uWater: { value: 1 },
    uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(16, 9) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }), [textures]);

  useFrame(({ clock, pointer }) => {
    const p = Math.min(Math.max(progress.current, 0), images.length - 1);
    const i = Math.min(Math.floor(p), images.length - 2);
    const from = textures[i], to = textures[i + 1] ?? from;
    uniforms.uFrom.value = from; uniforms.uTo.value = to;
    uniforms.uMix.value = p - i;
    uniforms.uWater.value = i === 0 ? 1 - (p - i) : 0.15;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uRes.value.set(size.width, size.height);
    const img = from.image as HTMLImageElement | undefined;
    if (img?.width) uniforms.uImg.value.set(img.width, img.height);
    mouse.current.lerp(new THREE.Vector2(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5), 0.08);
    uniforms.uMouse.value.copy(mouse.current);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthTest={false} />
    </mesh>
  );
}

function Petals({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.bezierCurveTo(-0.12, 0.2, -0.08, 0.42, 0.04, 0.44); s.bezierCurveTo(0.16, 0.44, 0.12, 0.2, 0, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  const seeds = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 12, y: Math.random() * 10 - 5, z: Math.random() * -4,
    speed: 0.15 + Math.random() * 0.35, spin: Math.random() * 2, phase: Math.random() * 6.28, scale: 0.25 + Math.random() * 0.35,
  })), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock, pointer, viewport }, dt) => {
    const t = clock.elapsedTime;
    const mx = pointer.x * viewport.width / 2, my = pointer.y * viewport.height / 2;
    seeds.forEach((s, i) => {
      s.y -= s.speed * dt;
      s.x += Math.sin(t * 0.6 + s.phase) * 0.004;
      const dx = mx - s.x, dy = my - s.y, d2 = dx * dx + dy * dy;
      if (d2 < 4) { s.x += dx * 0.004; s.y += dy * 0.004; }
      if (s.y < -6) { s.y = 6; s.x = (Math.random() - 0.5) * 12; }
      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(t * s.spin * 0.5, t * s.spin, s.phase);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      mesh.current!.setColorAt(i, color.set(i % 3 === 0 ? "#F9E27D" : i % 3 === 1 ? "#ffffff" : "#F7A49B"));
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    if (mesh.current!.instanceColor) mesh.current!.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[shape, undefined, count]}>
      <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.9} />
    </instancedMesh>
  );
}

export default function HeroCanvas({ images, progress, active, petals }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      onCreated={({ gl, setFrameloop }) => {
        gl.setClearColor("#0F4C4A");
        const check = () => { setFrameloop(active.current && !document.hidden ? "always" : "never"); requestAnimationFrame(check); };
        check();
      }}
      className="!absolute inset-0"
    >
      <ScenePlane images={images} progress={progress} />
      {petals > 0 && <Petals count={petals} />}
    </Canvas>
  );
}
```

Note: if `requestAnimationFrame(check)` keeps polling while frameloop is `never`, that is a cheap check and acceptable. If profiling shows otherwise, replace with a ScrollTrigger `onToggle` callback that calls `setFrameloop` directly (pass a setter ref up via `onCreated`).

- [ ] **Step 3: `HeroJourney.tsx`**

```tsx
"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import type { HeroScene } from "@/lib/data/types";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { canUseWebGL, isLowEndDevice, prefersReducedMotion } from "@/lib/motion";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

export function HeroJourney({ scenes }: { scenes: HeroScene[] }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const active = useRef(true);
  const [mode, setMode] = useState<"static" | "fallback" | "webgl">("static");

  useEffect(() => {
    if (prefersReducedMotion()) return setMode("static");
    const mobile = window.innerWidth < 768;
    setMode(canUseWebGL() && !isLowEndDevice() ? "webgl" : "fallback");
    root.current!.dataset.petals = mobile ? "40" : "120";
  }, []);

  useGSAP(() => {
    if (mode === "static") return;
    const n = scenes.length;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current, start: "top top", end: `+=${(n - 1) * 100}%`, pin: true, scrub: 0.6,
        onUpdate: (st) => { progress.current = st.progress * (n - 1); },
        onToggle: (st) => { active.current = st.isActive || st.progress === 0; },
      },
    });
    scenes.forEach((_, i) => {
      if (i === 0) return;
      const at = i - 1;
      tl.to(`[data-caption="${i - 1}"]`, { yPercent: -40, opacity: 0, duration: 0.4 }, at + 0.1)
        .fromTo(`[data-caption="${i}"]`, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4 }, at + 0.5);
      if (mode === "fallback") tl.fromTo(`[data-layer="${i}"]`, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 1 }, at);
    });
    tl.to("[data-progress]", { scaleX: 1, ease: "none", duration: n - 1 }, 0);
    const intro = () => gsap.from('[data-caption="0"] > *', { yPercent: 100, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out" });
    window.addEventListener("preloader:done", intro, { once: true });
    return () => window.removeEventListener("preloader:done", intro);
  }, { scope: root, dependencies: [mode] });

  return (
    <section ref={root} className="relative h-svh w-full overflow-hidden bg-teal text-cream" aria-label="Kerala journey">
      {/* Fallback/static image layers are always in server HTML */}
      {scenes.map((s, i) => (
        <div key={s.id} data-layer={i} className="absolute inset-0" style={{ opacity: i === 0 || mode === "static" ? (i === 0 ? 1 : 0) : 0 }}>
          <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
        </div>
      ))}
      {mode === "webgl" && (
        <HeroCanvas images={scenes.map((s) => s.image)} progress={progress} active={active}
          petals={Number(root.current?.dataset.petals ?? 80)} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/30" />
      <div className="relative z-10 flex h-full items-end px-6 pb-24 md:px-16">
        <div className="relative w-full max-w-5xl">
          {scenes.map((s, i) => (
            <div key={s.id} data-caption={i}
              className={mode === "static" ? "mb-10" : `absolute bottom-0 left-0 ${i === 0 ? "" : "opacity-0"}`}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold">{s.kicker}</p>
              {i === 0 ? (
                <h1 className="font-display text-5xl leading-[0.95] md:text-8xl">{s.title}</h1>
              ) : (
                <h2 className="font-display text-5xl leading-[0.95] md:text-8xl">{s.title}</h2>
              )}
            </div>
          ))}
        </div>
      </div>
      {mode !== "static" && (
        <div className="absolute bottom-8 left-6 right-6 z-10 h-px bg-cream/30 md:left-16 md:right-16">
          <div data-progress className="h-full origin-left scale-x-0 bg-coral" />
        </div>
      )}
    </section>
  );
}
```

Note: in `static` mode only scene 0 image shows and all captions stack, so reduced-motion and no-JS users read every scene's copy.

- [ ] **Step 4: Home page uses it — `src/app/page.tsx`**

```tsx
import { HeroJourney } from "@/components/motion/HeroJourney";
import { getHeroScenes } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <HeroJourney scenes={getHeroScenes()} />
      <section className="h-screen" />
    </main>
  );
}
```

- [ ] **Step 5: Verify in browser**

- Desktop Chrome: scroll pins hero, images crossfade with displacement, lower half of backwaters ripples, petals fall and drift toward the cursor, captions swap, progress bar fills, pin releases after scene 4.
- DevTools: disable WebGL (`chrome://flags` or run with `--disable-webgl`) or set `canUseWebGL` to return false temporarily: fallback image crossfades work.
- Reduced motion emulation: no pin, first image, all four captions visible.
- Performance panel: scrolling hero, no long tasks over 50ms after load.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: scroll-pinned WebGL hero journey with petals and fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Destination explorer, destination pages, Flip transition

**Files:**
- Create: `src/components/motion/DestinationExplorer.tsx`, `src/components/motion/TransitionOverlay.tsx`, `src/app/destinations/page.tsx`, `src/app/destinations/[slug]/page.tsx`, `src/app/not-found.tsx`
- Modify: `src/app/layout.tsx` (add `<TransitionOverlay />`), `src/app/page.tsx`

**Interfaces:**
- Consumes: `Destination`, `getDestinations`, `getDestination`, `getPackagesForDestination`, `Flip`, `ScrollTrigger`.
- Produces: `<DestinationExplorer destinations={Destination[]} />`; module `TransitionOverlay` exports `<TransitionOverlay />` and `expandToPage(card: HTMLElement, imageSrc: string, href: string, router: AppRouterInstance): void`.

- [ ] **Step 1: `TransitionOverlay.tsx`**

The overlay is a fixed full-screen image layer in the layout (persists across navigation). `expandToPage` records the card image rect, shows the overlay at that rect with the same image, Flips it to full-screen, pushes the route, then fades the overlay once the new page's hero image is ready (destination page hero has `data-dest-hero`).

```tsx
"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { gsap } from "@/lib/gsap";

let overlayEl: HTMLDivElement | null = null;

export function expandToPage(card: HTMLElement, imageSrc: string, href: string, router: AppRouterInstance) {
  const el = overlayEl;
  if (!el) return router.push(href);
  const r = card.getBoundingClientRect();
  const img = el.querySelector("img")!;
  img.src = imageSrc;
  gsap.set(el, { display: "block", top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: 24, opacity: 1 });
  gsap.to(el, { top: 0, left: 0, width: "100vw", height: "100svh", borderRadius: 0, duration: 0.8, ease: "expo.inOut",
    onComplete: () => router.push(href) });
}

export function TransitionOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => { overlayEl = ref.current; return () => { overlayEl = null; }; }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.style.display !== "block") return;
    const hero = document.querySelector<HTMLImageElement>("[data-dest-hero] img");
    const fade = () => gsap.to(el, { opacity: 0, duration: 0.5, delay: 0.1, onComplete: () => gsap.set(el, { display: "none" }) });
    if (!hero || hero.complete) fade(); else hero.addEventListener("load", fade, { once: true });
    const safety = setTimeout(fade, 1500);
    return () => clearTimeout(safety);
  }, [pathname]);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed z-[120] hidden overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="h-full w-full object-cover" />
    </div>
  );
}
```

Add `<TransitionOverlay />` to layout body after `<Cursor />`.

- [ ] **Step 2: `DestinationExplorer.tsx`**

```tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { expandToPage } from "./TransitionOverlay";

export function DestinationExplorer({ destinations }: { destinations: Destination[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const dist = () => track.current!.scrollWidth - window.innerWidth + 64;
      gsap.to(track.current, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) =>
        gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: true } }));
    });
    return () => mm.revert();
  }, { scope: root });

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, d: Destination) => {
    if (prefersReducedMotion() || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    expandToPage(e.currentTarget.querySelector("[data-card-img]") as HTMLElement, d.image, `/destinations/${d.slug}`, router);
  };

  return (
    <section ref={root} className="overflow-hidden bg-cream py-24 md:flex md:h-svh md:items-center md:py-0" aria-label="Destinations">
      <div ref={track} className="flex gap-6 px-6 max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto md:px-16">
        <div className="flex w-[80vw] shrink-0 flex-col justify-center md:w-[32vw]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-coral">Where to next</p>
          <h2 className="font-display text-5xl leading-none md:text-7xl">Places we know by heart</h2>
          <Link href="/destinations" className="mt-8 underline underline-offset-4 hover:text-coral">All destinations</Link>
        </div>
        {destinations.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} onClick={(e) => onClick(e, d)}
            className="group relative w-[75vw] shrink-0 snap-center md:w-[28vw]" data-cursor>
            <div data-card-img className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image data-parallax src={d.image} alt={d.name} fill sizes="(min-width:768px) 28vw, 75vw"
                className="scale-110 object-cover transition-transform duration-700 group-hover:scale-125" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ink/60">{d.tagline}</p>
            <h3 className="font-display text-3xl">{d.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `src/app/destinations/[slug]/page.tsx`**

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestination, getDestinations, getPackagesForDestination } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCard } from "@/components/ui/PackageCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const generateStaticParams = () => getDestinations().map((d) => ({ slug: d.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = getDestination((await params).slug);
  return d ? { title: `${d.name} Tours`, description: `${d.tagline}. ${d.story}`, openGraph: { images: [d.image] } } : {};
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = getDestination((await params).slug);
  if (!d) notFound();
  const pkgs = getPackagesForDestination(d.slug);
  return (
    <main>
      <section data-dest-hero className="relative h-svh overflow-hidden text-cream">
        <Image src={d.image} alt={d.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-16 left-6 md:left-16">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">{d.tagline}</p>
          <SplitReveal as="h1" immediate className="font-display text-6xl md:text-9xl">{d.name}</SplitReveal>
        </div>
      </section>
      <section className="grid gap-16 px-6 py-24 md:grid-cols-2 md:px-16">
        <p className="font-display text-2xl leading-snug md:text-4xl">{d.story}</p>
        <Reveal>
          <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-coral">Highlights</h2>
          <ul className="space-y-3 text-lg">{d.highlights.map((h) => <li key={h} className="border-b border-ink/10 pb-3">{h}</li>)}</ul>
          <p className="mt-8 text-sm text-ink/60">Best time to visit: <strong className="text-ink">{d.bestTime}</strong></p>
          <div className="mt-8"><Button href={`/contact?destination=${d.slug}`}>Plan a {d.name} trip</Button></div>
        </Reveal>
      </section>
      {pkgs.length > 0 && (
        <section className="bg-teal px-6 py-24 text-cream md:px-16">
          <SectionHeading light kicker="Packages" title={`Ways to see ${d.name}`} />
          <div className="mt-12 grid gap-8 md:grid-cols-3">{pkgs.map((p) => <PackageCard key={p.slug} pkg={p} />)}</div>
        </section>
      )}
    </main>
  );
}
```

`PackageCard` is created in Task 10. To keep this task buildable, create `src/components/ui/PackageCard.tsx` now:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Package } from "@/lib/data/types";

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Link href={`/packages/${pkg.slug}`} className="group block" data-cursor data-flip-id={pkg.slug}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
        <Image src={pkg.image} alt={pkg.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-ink">{pkg.durationDays}D / {pkg.durationDays - 1}N</span>
      </div>
      <h3 className="mt-4 font-display text-2xl">{pkg.title}</h3>
      <p className="mt-1 text-sm opacity-70">{pkg.summary}</p>
    </Link>
  );
}
```

- [ ] **Step 4: `src/app/destinations/page.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { getDestinations } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Destinations", description: "Kerala, India and international destinations by Plumeria Holidays." };

export default function DestinationsPage() {
  const groups = [{ label: "Kerala & India", items: getDestinations("domestic") }, { label: "International", items: getDestinations("international") }];
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Destinations" title="Every journey starts with a place" />
      {groups.map((g) => (
        <section key={g.label} className="mt-20">
          <h2 className="mb-8 text-xs uppercase tracking-[0.3em] text-coral">{g.label}</h2>
          <Reveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {g.items.map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}`} className="group" data-cursor>
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                  <Image src={d.image} alt={d.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <h3 className="mt-4 font-display text-2xl">{d.name}</h3>
                <p className="text-sm text-ink/60">{d.tagline}</p>
              </Link>
            ))}
          </Reveal>
        </section>
      ))}
    </main>
  );
}
```

- [ ] **Step 5: `src/app/not-found.tsx`**

```tsx
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo className="h-20 w-20 text-teal" />
      <h1 className="font-display text-6xl">Lost in the backwaters</h1>
      <p className="text-ink/70">This page drifted away. Let us steer you home.</p>
      <Button href="/">Back to home</Button>
    </main>
  );
}
```

- [ ] **Step 6: Add explorer to home**

In `src/app/page.tsx` replace the empty section with `<DestinationExplorer destinations={getDestinations().slice(0, 8)} />` (import `getDestinations` and the component).

- [ ] **Step 7: Verify**

Run: `npm run build` (expected: `/destinations/[slug]` statically generated for all 16 slugs). In browser: horizontal pinned scroll on desktop, swipe snap on mobile; clicking a card expands its image to full screen and lands on the destination page; `/destinations/xyz` shows the 404 page; back button returns to home with ScrollTrigger working (scroll hero again).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: destination explorer, destination pages, shared-element transition

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Interactive Kerala map

**Files:**
- Create: `src/components/motion/KeralaMap.tsx`, `src/components/motion/keralaPath.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getKeralaDestinations()` (`map.x`, `map.y` in a 400x800 viewBox), `DrawSVGPlugin`, `ScrollTrigger`.
- Produces: `<KeralaMap stops={Destination[]} />`.

- [ ] **Step 1: `keralaPath.ts`**

Simplified stylized outline of Kerala in a 400x800 viewBox (coast on the left, Western Ghats on the right, narrowing south). Before committing, open the rendered SVG in the browser and adjust control points until the silhouette reads as Kerala (long thin strip, north-west to south-east tilt).

```ts
export const KERALA_OUTLINE =
  "M70 30 C 95 25, 130 40, 150 60 C 175 90, 185 130, 200 170 C 215 210, 225 250, 240 300 C 255 345, 270 380, 280 420 C 290 470, 285 520, 275 570 C 262 620, 245 665, 220 710 C 205 740, 190 765, 175 780 C 165 760, 160 735, 150 700 C 140 655, 125 600, 112 545 C 100 490, 92 440, 85 390 C 78 330, 70 270, 62 210 C 55 150, 50 90, 70 30 Z";

/** Builds a smooth route through the stops in order. */
export function routeThrough(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i - 1], q = points[i];
    const mx = (p.x + q.x) / 2;
    d += ` C ${mx + 30} ${p.y}, ${mx - 30} ${q.y}, ${q.x} ${q.y}`;
  }
  return d;
}
```

- [ ] **Step 2: Add a test for `routeThrough` in `tests/motion.test.ts`**

```ts
import { routeThrough } from "@/components/motion/keralaPath";
test("routeThrough", () => {
  expect(routeThrough([{ x: 0, y: 0 }])).toBe("");
  const d = routeThrough([{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 30, y: 40 }]);
  expect(d.startsWith("M0 0")).toBe(true);
  expect(d.match(/C/g)?.length).toBe(2);
  expect(d.endsWith("30 40")).toBe(true);
});
```

Run: `npm test` → PASS.

- [ ] **Step 3: `KeralaMap.tsx`**

```tsx
"use client";
import Link from "next/link";
import { useRef } from "react";
import type { Destination } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { KERALA_OUTLINE, routeThrough } from "./keralaPath";

export function KeralaMap({ stops }: { stops: Destination[] }) {
  const root = useRef<HTMLElement>(null);
  const route = routeThrough(stops.map((s) => s.map!));

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const n = stops.length;
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: `+=${n * 60}%`, pin: true, scrub: 0.6 } });
    tl.from(".km-outline", { drawSVG: 0, duration: 1, ease: "none" })
      .from(".km-route", { drawSVG: 0, duration: n, ease: "none" }, 0.5);
    stops.forEach((_, i) => {
      const at = 0.5 + (i / Math.max(n - 1, 1)) * n;
      tl.from(`[data-pin="${i}"]`, { scale: 0, transformOrigin: "center", duration: 0.3, ease: "back.out(3)" }, at - 0.15)
        .from(`[data-stop="${i}"]`, { x: 30, opacity: 0, duration: 0.3 }, at - 0.15);
    });
  }, { scope: root });

  return (
    <section ref={root} className="grid min-h-svh items-center gap-10 bg-green px-6 py-24 text-cream md:grid-cols-2 md:px-16" aria-label="Kerala route map">
      <svg viewBox="0 0 400 800" className="mx-auto h-[70svh] w-auto" role="img" aria-label="Map of Kerala with our classic route">
        <path className="km-outline" d={KERALA_OUTLINE} fill="none" stroke="#FBF6EC" strokeOpacity="0.5" strokeWidth="2" />
        <path className="km-route" d={route} fill="none" stroke="#E8B04B" strokeWidth="3" strokeDasharray="0" strokeLinecap="round" />
        {stops.map((s, i) => (
          <g key={s.slug} data-pin={i}>
            <circle cx={s.map!.x} cy={s.map!.y} r="9" fill="#F2766B" />
            <circle cx={s.map!.x} cy={s.map!.y} r="16" fill="none" stroke="#F2766B" strokeOpacity="0.5" />
            <text x={s.map!.x + 22} y={s.map!.y + 5} fill="#FBF6EC" fontSize="18" className="font-display">{s.name}</text>
          </g>
        ))}
      </svg>
      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">The Kerala circuit</p>
        <h2 className="font-display text-4xl md:text-6xl">From the hills to the sea, in one journey</h2>
        <ol className="mt-10 space-y-4">
          {stops.map((s, i) => (
            <li key={s.slug} data-stop={i}>
              <Link href={`/destinations/${s.slug}`} className="group flex items-baseline gap-4" data-cursor>
                <span className="text-sm text-gold">0{i + 1}</span>
                <span className="font-display text-2xl group-hover:text-coral">{s.name}</span>
                <span className="text-sm text-cream/60">{s.tagline}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add to home after the explorer**

```tsx
<KeralaMap stops={getKeralaDestinations()} />
```

- [ ] **Step 5: Verify in browser**

Map section pins, outline draws, gold route draws from Wayanad to Kovalam, each pin pops as the line arrives, list items slide in, links go to destination pages. Adjust `map.x/y` in `destinations.ts` if a pin sits outside the outline (`npm test` must still pass).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: scroll-drawn interactive Kerala map

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Packages listing with Flip filter, package detail

**Files:**
- Create: `src/components/motion/PackageFilter.tsx`, `src/app/packages/page.tsx`, `src/app/packages/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getPackages`, `getPackage`, `getHolidayTypes`, `getDestination`, `PackageCard`, `Flip`.
- Produces: `<PackageFilter packages={Package[]} types={HolidayType[]} initialType?: HolidayTypeSlug />`.

- [ ] **Step 1: `PackageFilter.tsx`**

```tsx
"use client";
import { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { HolidayType, HolidayTypeSlug, Package, Region } from "@/lib/data/types";
import { Flip, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { PackageCard } from "@/components/ui/PackageCard";

export function PackageFilter({ packages, types, initialType }:
  { packages: Package[]; types: HolidayType[]; initialType?: HolidayTypeSlug }) {
  const [region, setRegion] = useState<Region | "all">("all");
  const [type, setType] = useState<HolidayTypeSlug | "all">(initialType ?? "all");
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const visible = useMemo(() => packages.filter((p) =>
    (region === "all" || p.region === region) && (type === "all" || p.holidayTypes.includes(type))), [packages, region, type]);

  const change = (fn: () => void) => {
    if (!prefersReducedMotion() && grid.current) flipState.current = Flip.getState(grid.current.children);
    fn();
  };

  useLayoutEffect(() => {
    if (!flipState.current || !grid.current) return;
    Flip.from(flipState.current, { duration: 0.6, ease: "power3.inOut", absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }) });
    flipState.current = null;
  }, [visible]);

  const chip = (active: boolean) => `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-teal bg-teal text-cream" : "border-ink/20 hover:border-teal"}`;

  return (
    <div>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Region">
        {(["all", "domestic", "international"] as const).map((r) => (
          <button key={r} aria-pressed={region === r} className={chip(region === r)} onClick={() => change(() => setRegion(r))}>
            {r === "all" ? "All" : r === "domestic" ? "India" : "International"}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Holiday type">
        <button aria-pressed={type === "all"} className={chip(type === "all")} onClick={() => change(() => setType("all"))}>Any type</button>
        {types.map((t) => (
          <button key={t.slug} aria-pressed={type === t.slug} className={chip(type === t.slug)} onClick={() => change(() => setType(t.slug))}>{t.name}</button>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink/60" aria-live="polite">{visible.length} {visible.length === 1 ? "package" : "packages"}</p>
      <div ref={grid} className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => <PackageCard key={p.slug} pkg={p} />)}
      </div>
      {visible.length === 0 && <p className="mt-8 text-lg">No packages match yet. <a href="/contact" className="text-coral underline">Ask us to build one for you.</a></p>}
    </div>
  );
}
```

- [ ] **Step 2: `src/app/packages/page.tsx`**

```tsx
import { getHolidayTypes, getPackages, type HolidayTypeSlug } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageFilter } from "@/components/motion/PackageFilter";

export const metadata = { title: "Tour Packages", description: "Kerala, India and international holiday packages." };

export default async function PackagesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const types = getHolidayTypes();
  const t = (await searchParams).type;
  const initialType = types.some((x) => x.slug === t) ? (t as HolidayTypeSlug) : undefined;
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Packages" title="Ready-made journeys, made to bend" intro="Every package can be tailored: dates, hotels, pace and budget." />
      <div className="mt-12"><PackageFilter packages={getPackages()} types={types} initialType={initialType} /></div>
    </main>
  );
}
```

- [ ] **Step 3: `src/app/packages/[slug]/page.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDestination, getPackage, getPackages } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const generateStaticParams = () => getPackages().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPackage((await params).slug);
  return p ? { title: `${p.title} (${p.durationDays} days)`, description: p.summary, openGraph: { images: [p.image] } } : {};
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPackage((await params).slug);
  if (!p) notFound();
  return (
    <main>
      <section className="relative h-[80svh] overflow-hidden text-cream">
        <Image src={p.image} alt={p.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-14 left-6 md:left-16">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">{p.durationDays} days · {p.destinationSlugs.map((s) => getDestination(s)?.name).join(" · ")}</p>
          <SplitReveal as="h1" immediate className="font-display text-5xl md:text-8xl">{p.title}</SplitReveal>
        </div>
      </section>
      <section className="grid gap-16 px-6 py-24 md:grid-cols-[2fr_1fr] md:px-16">
        <div>
          <p className="font-display text-2xl md:text-3xl">{p.summary}</p>
          <ol className="relative mt-14 space-y-10 border-l border-ink/15 pl-8">
            {p.itinerary.map((d) => (
              <li key={d.day}>
                <Reveal>
                  <span className="absolute -left-[7px] mt-2 h-3 w-3 rounded-full bg-coral" aria-hidden />
                  <p className="text-xs uppercase tracking-[0.3em] text-coral">Day {d.day}</p>
                  <h2 className="mt-1 font-display text-2xl">{d.title}</h2>
                  <p className="mt-1 text-ink/70">{d.blurb}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
        <aside className="h-fit rounded-3xl bg-teal p-8 text-cream md:sticky md:top-28">
          <h2 className="text-xs uppercase tracking-[0.3em] text-gold">Included</h2>
          <ul className="mt-4 space-y-2">{p.inclusions.map((i) => <li key={i}>· {i}</li>)}</ul>
          <p className="mt-6 text-sm text-cream/70">{p.priceFrom ? `From ₹${p.priceFrom.toLocaleString("en-IN")} per person` : "Price on request, tailored to your dates."}</p>
          <div className="mt-8"><Button href={`/contact?package=${p.slug}`}>Enquire now</Button></div>
          <Link href="/packages" className="mt-6 block text-sm underline underline-offset-4">All packages</Link>
        </aside>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify**

`npm run build` (all package slugs generated). Browser: chips animate cards with Flip; zero-result combo (International + Houseboat) shows the fallback message; `/packages?type=honeymoon` preselects; detail page itinerary reveals; `/packages/xyz` shows 404.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: packages listing with Flip filter and package detail

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Complete home page sections

**Files:**
- Create: `src/components/ui/HomeSections.tsx` (server components: `FeaturedPackages`, `HolidayTypesGrid`, `Stats`, `Testimonials`, `CtaBand`), `src/components/motion/CountUp.tsx`, `src/components/motion/Marquee.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getFeaturedPackages`, `getHolidayTypes`, `getTestimonials`, `PackageCard`, `SectionHeading`, `Button`, `Reveal`.
- Produces: `<CountUp to={number} suffix?: string />`, `<Marquee items={string[]} />`.

- [ ] **Step 1: `CountUp.tsx` and `Marquee.tsx`**

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 2, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 90%" },
      onUpdate: () => { ref.current!.textContent = `${Math.round(o.v).toLocaleString("en-IN")}${suffix}`; } });
  });
  return <span ref={ref}>{to.toLocaleString("en-IN")}{suffix}</span>;
}
```

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const t = gsap.to(".mq-track", { xPercent: -50, ease: "none", duration: 30, repeat: -1 });
    const st = { v: 1 };
    const onScroll = () => { gsap.to(t, { timeScale: 3, duration: 0.2, overwrite: true }); gsap.to(t, { timeScale: st.v, duration: 1, delay: 0.2 }); };
    window.addEventListener("wheel", onScroll, { passive: true });
    return () => window.removeEventListener("wheel", onScroll);
  }, { scope: ref });
  const row = items.map((i) => <span key={i} className="mx-8">{i} <span className="text-coral">✿</span></span>);
  return (
    <div ref={ref} className="overflow-hidden whitespace-nowrap border-y border-ink/10 py-6 font-display text-4xl md:text-6xl" aria-hidden>
      <div className="mq-track inline-flex">{row}{row}</div>
    </div>
  );
}
```

- [ ] **Step 2: `HomeSections.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { getFeaturedPackages, getHolidayTypes, getTestimonials } from "@/lib/data";
import { PackageCard } from "./PackageCard";
import { SectionHeading } from "./SectionHeading";
import { Button } from "./Button";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";

export function FeaturedPackages() {
  return (
    <section className="px-6 py-28 md:px-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading kicker="Featured" title="Journeys our travellers love" />
        <Button href="/packages" variant="ghost">All packages</Button>
      </div>
      <Reveal className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {getFeaturedPackages().slice(0, 6).map((p) => <PackageCard key={p.slug} pkg={p} />)}
      </Reveal>
    </section>
  );
}

export function HolidayTypesGrid() {
  return (
    <section className="bg-teal px-6 py-28 text-cream md:px-16">
      <SectionHeading light kicker="Holiday types" title="However you like to travel" />
      <Reveal className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getHolidayTypes().map((t) => (
          <Link key={t.slug} href={`/packages?type=${t.slug}`} className="group relative aspect-[4/3] overflow-hidden rounded-3xl" data-cursor>
            <Image src={t.image} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-display text-3xl">{t.name}</h3>
              <p className="mt-1 max-h-0 overflow-hidden text-sm text-cream/80 transition-all duration-500 group-hover:max-h-20">{t.blurb}</p>
            </div>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}

// Stats are PLACEHOLDER values: confirm with client before launch.
const stats = [{ to: 15, suffix: "+", label: "Years of journeys" }, { to: 25000, suffix: "+", label: "Happy travellers" }, { to: 7, suffix: "", label: "Offices" }, { to: 30, suffix: "+", label: "Destinations" }];
export function Stats() {
  return (
    <section className="grid grid-cols-2 gap-10 px-6 py-24 md:grid-cols-4 md:px-16">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="font-display text-5xl text-teal md:text-7xl"><CountUp to={s.to} suffix={s.suffix} /></p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-ink/60">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-cream px-6 py-28 md:px-16">
      <SectionHeading kicker="Memories" title="Stories from the road" />
      <Reveal className="mt-14 grid gap-8 md:grid-cols-3">
        {getTestimonials().map((t) => (
          <figure key={t.name} className="rounded-3xl bg-white/70 p-8 shadow-sm">
            <blockquote className="font-display text-xl leading-snug">“{t.quote}”</blockquote>
            <figcaption className="mt-6 text-sm"><strong>{t.name}</strong> · <span className="text-ink/60">{t.trip}</span></figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="petal-gradient px-6 py-32 text-center md:px-16">
      <h2 className="mx-auto max-w-4xl font-display text-5xl leading-none text-ink md:text-8xl">Tell us the dream. We'll plan the rest.</h2>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button href="/contact">Plan my trip</Button>
        <Button href="https://wa.me/919048833330" variant="ghost" external>WhatsApp us</Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Final `src/app/page.tsx`**

```tsx
import { HeroJourney } from "@/components/motion/HeroJourney";
import { DestinationExplorer } from "@/components/motion/DestinationExplorer";
import { KeralaMap } from "@/components/motion/KeralaMap";
import { Marquee } from "@/components/motion/Marquee";
import { FeaturedPackages, HolidayTypesGrid, Stats, Testimonials, CtaBand } from "@/components/ui/HomeSections";
import { getDestinations, getHeroScenes, getKeralaDestinations } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <HeroJourney scenes={getHeroScenes()} />
      <Marquee items={["Houseboats", "Tea hills", "Spice trails", "Beaches", "Ayurveda", "Kathakali", "Wildlife"]} />
      <DestinationExplorer destinations={getDestinations().slice(0, 8)} />
      <KeralaMap stops={getKeralaDestinations()} />
      <FeaturedPackages />
      <HolidayTypesGrid />
      <Stats />
      <Testimonials />
      <CtaBand />
    </main>
  );
}
```

- [ ] **Step 4: Verify**

`npm run build`. Browser: scroll the full home page top to bottom twice on desktop and at 390px; each pinned section releases cleanly into the next; no overlapping pin spacers; counters run once.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: complete home page sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Holiday types, about, memories, contact pages

**Files:**
- Create: `src/app/holiday-types/page.tsx`, `src/app/about/page.tsx`, `src/app/memories/page.tsx`, `src/app/contact/page.tsx`, `src/components/ui/ContactForm.tsx`

**Interfaces:**
- Consumes: `getHolidayTypes`, `getOffices`, `getMemories`, `getPackage`, `getDestination`, `POST /api/inquiry`, `site`.
- Produces: `<ContactForm defaultMessage?: string packageSlug?: string />`.

- [ ] **Step 1: `holiday-types/page.tsx`**

```tsx
import Image from "next/image";
import { getHolidayTypes, getPackages } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Holiday Types", description: "Honeymoon, family, houseboat, adventure, group and cruise holidays." };

export default function HolidayTypesPage() {
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Holiday types" title="Pick a mood, we'll find the place" />
      <div className="mt-20 space-y-24">
        {getHolidayTypes().map((t, i) => (
          <Reveal key={t.slug} className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src={t.image} alt={t.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <h2 className="font-display text-5xl">{t.name}</h2>
              <p className="mt-4 text-lg text-ink/70">{t.blurb}</p>
              <p className="mt-2 text-sm text-ink/50">{getPackages({ type: t.slug }).length} packages</p>
              <div className="mt-8"><Button href={`/packages?type=${t.slug}`}>See {t.name.toLowerCase()} packages</Button></div>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: `about/page.tsx`**

```tsx
import { getOffices } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const metadata = { title: "About Us", description: "Plumeria Holidays: a Kochi-based travel company crafting tailor-made journeys." };

const values = [
  { t: "Never compromise on quality", d: "Hand-picked stays, trusted drivers and partners we've worked with for years." },
  { t: "Made for you", d: "Every itinerary is shaped around your dates, pace and budget." },
  { t: "With you all the way", d: "Offices across India and in Bangkok, and a phone that's always answered." },
];

export default function AboutPage() {
  return (
    <main className="pb-24 pt-40">
      <section className="px-6 md:px-16">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-coral">About us</p>
        <SplitReveal as="h1" immediate className="max-w-5xl font-display text-5xl leading-[1.02] md:text-8xl">Born in Kochi. Travelling everywhere.</SplitReveal>
        <p className="mt-10 max-w-2xl text-lg text-ink/70">
          Plumeria Holidays is a Kochi-based travel company crafting tailor-made holidays across Kerala, India and the world, from houseboat nights on Vembanad Lake to group tours through Europe. We handle flights, hotels, transfers and every detail between.
        </p>
      </section>
      <section className="mt-28 grid gap-10 bg-teal px-6 py-24 text-cream md:grid-cols-3 md:px-16">
        {values.map((v) => (
          <Reveal key={v.t}><h2 className="font-display text-3xl">{v.t}</h2><p className="mt-3 text-cream/75">{v.d}</p></Reveal>
        ))}
      </section>
      <section className="px-6 pt-28 md:px-16">
        <SectionHeading kicker="Offices" title="Seven cities, one team" />
        <Reveal className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {getOffices().map((o) => (
            <div key={o.city} className="rounded-3xl border border-ink/10 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-coral">{o.role}</p>
              <p className="mt-2 font-display text-3xl">{o.city}</p>
            </div>
          ))}
        </Reveal>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: `memories/page.tsx` (masonry with reveal)**

```tsx
import Image from "next/image";
import { getMemories } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Memories", description: "Moments from Plumeria Holidays travellers." };

export default function MemoriesPage() {
  return (
    <main className="px-6 pb-24 pt-40 md:px-16">
      <SectionHeading kicker="Memories" title="Moments our travellers brought home" />
      <Reveal className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3">
        {getMemories().map((m, i) => (
          <figure key={m.image} className="mb-6 break-inside-avoid">
            <div className={`relative overflow-hidden rounded-3xl ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
              <Image src={m.image} alt={m.caption} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-sm text-ink/60">{m.caption}</figcaption>
          </figure>
        ))}
      </Reveal>
    </main>
  );
}
```

- [ ] **Step 4: `ContactForm.tsx`**

```tsx
"use client";
import { useState } from "react";

type Errors = Record<string, string>;
export function ContactForm({ defaultMessage = "", packageSlug }: { defaultMessage?: string; packageSlug?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending"); setErrors({});
    const body = { ...Object.fromEntries(new FormData(e.currentTarget)), packageSlug };
    try {
      const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.ok) setStatus("sent"); else { setErrors(json.errors ?? {}); setStatus("idle"); }
    } catch { setStatus("error"); }
  }

  if (status === "sent")
    return <div role="status" className="rounded-3xl bg-green p-10 text-cream"><h2 className="font-display text-4xl">Thank you!</h2><p className="mt-3">Our team will call you within one working day.</p></div>;

  const field = "w-full rounded-2xl border border-ink/15 bg-white/70 px-5 py-4 outline-none focus:border-teal";
  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="mt-1 text-sm text-coral">{errors[k]}</p>;
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div><label htmlFor="name" className="mb-2 block text-sm">Name</label>
        <input id="name" name="name" className={field} aria-invalid={!!errors.name} aria-describedby="name-err" autoComplete="name" />{err("name")}</div>
      <div className="grid gap-5 md:grid-cols-2">
        <div><label htmlFor="phone" className="mb-2 block text-sm">Phone / WhatsApp</label>
          <input id="phone" name="phone" type="tel" className={field} aria-invalid={!!errors.phone} aria-describedby="phone-err" autoComplete="tel" />{err("phone")}</div>
        <div><label htmlFor="email" className="mb-2 block text-sm">Email (optional)</label>
          <input id="email" name="email" type="email" className={field} aria-invalid={!!errors.email} aria-describedby="email-err" autoComplete="email" />{err("email")}</div>
      </div>
      <div><label htmlFor="message" className="mb-2 block text-sm">Tell us about your trip</label>
        <textarea id="message" name="message" rows={5} defaultValue={defaultMessage} className={field} />{err("message")}</div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {errors.website && <p className="text-sm text-coral">Something went wrong. Please call us instead.</p>}
      {status === "error" && <p role="alert" className="text-sm text-coral">Couldn't send. Check your connection or WhatsApp us.</p>}
      <button disabled={status === "sending"} className="rounded-full bg-coral px-8 py-4 font-semibold text-cream transition-colors hover:bg-teal disabled:opacity-60">
        {status === "sending" ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: `contact/page.tsx`**

```tsx
import { getDestination, getOffices, getPackage } from "@/lib/data";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/ui/ContactForm";
import { SplitReveal } from "@/components/motion/SplitReveal";

export const metadata = { title: "Contact", description: "Plan your holiday with Plumeria Holidays, Kochi." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ package?: string; destination?: string }> }) {
  const sp = await searchParams;
  const pkg = sp.package ? getPackage(sp.package) : undefined;
  const dest = sp.destination ? getDestination(sp.destination) : undefined;
  const msg = pkg ? `I'm interested in the ${pkg.title} package.` : dest ? `I'd like to plan a trip to ${dest.name}.` : "";
  return (
    <main className="grid gap-16 px-6 pb-24 pt-40 md:grid-cols-2 md:px-16">
      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-coral">Contact</p>
        <SplitReveal as="h1" immediate className="font-display text-5xl leading-none md:text-7xl">Let's plan something beautiful</SplitReveal>
        <div className="mt-10 space-y-2 text-lg">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="block hover:text-coral">{site.phone}</a>
          <a href={`mailto:${site.email}`} className="block break-all hover:text-coral">{site.email}</a>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="block text-green hover:text-coral">Chat on WhatsApp</a>
        </div>
        <p className="mt-10 text-sm text-ink/60">Offices: {getOffices().map((o) => `${o.city}${o.role === "HQ" ? " (HQ)" : ""}`).join(", ")}</p>
      </div>
      <ContactForm defaultMessage={msg} packageSlug={pkg?.slug} />
    </main>
  );
}
```

- [ ] **Step 6: Verify**

`npm run build`. Browser: each page renders; `/contact?package=bali-escape-6d` pre-fills message; submit empty shows name and phone errors inline; valid submit shows thank-you; server log prints `[inquiry]`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: holiday types, about, memories, contact pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: SEO (sitemap, robots, JSON-LD)

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/ui/JsonLd.tsx`, `src/lib/seo.ts`
- Modify: `src/app/layout.tsx`, `src/app/packages/[slug]/page.tsx`
- Test: `tests/seo.test.ts`

**Interfaces:**
- Produces: `travelAgencyLd(): object`, `tripLd(p: Package): object`, `<JsonLd data={object} />`.

- [ ] **Step 1: Failing test `tests/seo.test.ts`**

```ts
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
```

Run: `npm test -- seo` → FAIL.

- [ ] **Step 2: Implement `src/lib/seo.ts`, `JsonLd.tsx`, `sitemap.ts`, `robots.ts`**

```ts
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
  itinerary: { "@type": "ItemList", itemListElement: p.itinerary.map((d) => ({ "@type": "ListItem", position: d.day, name: d.title, description: d.blurb })) },
  provider: { "@type": "TravelAgency", name: site.name, url: site.url },
});
```

```tsx
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
```

```ts
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
```

```ts
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${site.url}/sitemap.xml` };
}
```

- [ ] **Step 3: Use them**

In `layout.tsx` body add `<JsonLd data={travelAgencyLd()} />`. In `packages/[slug]/page.tsx` add `<JsonLd data={tripLd(p)} />` inside `<main>`.

- [ ] **Step 4: Verify**

Run: `npm test` → all PASS. `npm run build && npm start`, then `curl -s localhost:3000/sitemap.xml | head` and `curl -s localhost:3000/packages/bali-escape-6d | grep -c TouristTrip` (expected: 1).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: sitemap, robots and JSON-LD

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Polish and verification pass

**Files:**
- Modify: any file needing fixes found below.

- [ ] **Step 1: Lint, tests, build**

Run: `npm run lint && npm test && npm run build`
Expected: zero errors.

- [ ] **Step 2: Route-change cleanup (Review Focus 1)**

On `npm start`: scroll home to the Kerala map, click a destination in the list, press Back, scroll the whole home page again, then go to `/packages` and back. Expected: no stuck pinned sections, no blank gaps, hero still scrubs, no console errors.

- [ ] **Step 3: Fallback and reduced motion (Review Focus 2)**

DevTools Rendering: emulate `prefers-reduced-motion: reduce`, reload `/`. Expected: no preloader, no pins, hero shows first image and all four captions, all content readable. Then disable WebGL via `chrome://flags/#disable-webgl` (or launch with `--disable-webgl`): hero uses image crossfade fallback.

- [ ] **Step 4: Lighthouse (mobile, production)**

Run: `npx lighthouse http://localhost:3000 --form-factor=mobile --only-categories=performance,accessibility,seo --output=json --output-path=./.lh.json --chrome-flags="--headless"` and print scores with `node -e "const r=require('./.lh.json');for(const[k,v]of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"`.
Expected: performance >= 85, accessibility >= 95, seo >= 95. If performance is short: compress images in `public/images` to max 1600px wide with `npx sharp-cli` or `sips -Z 1600`, confirm hero canvas is only loaded after `mode` resolves, and lower petal count. Repeat for `/packages/kerala-classic-6d`. Delete `.lh.json` afterwards (add to `.gitignore`).

- [ ] **Step 5: Mobile pass at 390px**

Every page: no horizontal page scroll (`document.documentElement.scrollWidth === innerWidth` in console), tap targets usable, mobile menu works, explorer swipes.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: polish and verification fixes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
