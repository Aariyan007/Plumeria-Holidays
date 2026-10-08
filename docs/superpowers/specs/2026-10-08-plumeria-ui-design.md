# Plumeria Holidays: New Website (UI Phase) Design

Date: 2026-10-08
Status: Approved

## 1. Purpose

Rebuild the marketing site for Plumeria Holidays (Kochi, Kerala tour operator, https://www.plumeriaholidays.com/) with a new, highly animated design built on Next.js and GSAP. The site must convert visitors into inquiries (form and WhatsApp), load fast, and be server-rendered for SEO.

This spec covers **phase 1: UI only**. AI features come in a later phase and are explicitly out of scope here, but the data layer is shaped so they can plug in without UI rewrites.

### Success criteria

- All pages in section 4 render server-side with correct metadata and are navigable.
- All signature features in section 5 work on desktop and degrade sensibly on mobile.
- Lighthouse (mobile, production build): Performance >= 85, Accessibility >= 95, SEO >= 95.
- Scrolling stays smooth (target 60fps desktop, no long tasks from animation setup on mid-range mobile).
- `prefers-reduced-motion` users get a fully usable, mostly static site.
- `next build` and lint pass clean.

## 2. Non-goals (phase 1)

- AI features (trip planner, chat concierge, vibe search, etc.): phase 2.
- CMS, admin panel, user accounts, real payments (payment links out to the existing payment page).
- Email delivery for the contact form beyond a working route handler stub.
- Final photography: placeholders are used until Plumeria supplies assets.

## 3. Stack

- Next.js (App Router), TypeScript, React Server Components by default.
- Tailwind CSS for styling, with design tokens as CSS variables.
- GSAP (core, ScrollTrigger, SplitText, DrawSVGPlugin, Flip, `@gsap/react` `useGSAP`). Verify at install that these plugins ship in the public `gsap` package; if any does not, fall back to an equivalent approach and note it.
- Lenis for smooth scroll, synced to ScrollTrigger.
- three.js via `@react-three/fiber` and `@react-three/drei` for the hero WebGL layer only (see 5.2), loaded with a dynamic import and never server-rendered.
- `next/image` (AVIF/WebP) and `next/font`.

## 4. Pages

| Route | Content |
|---|---|
| `/` | Preloader, scroll-pinned hero journey, destination explorer, interactive Kerala map, featured packages, holiday types, stats, testimonials, CTA |
| `/destinations` | Gallery of all destinations |
| `/destinations/[slug]` | Full-bleed destination page: story, highlights, best time to visit, related packages, inquire CTA |
| `/packages` | Domestic and International tabs, Flip-animated filtering |
| `/packages/[slug]` | Package detail: itinerary outline, inclusions, inquire CTA |
| `/holiday-types` | Honeymoon, Family, Houseboat, Adventure, Group, Cruise |
| `/about` | Story, offices (Kochi HQ, Bangalore, Mumbai, Coimbatore, Chennai, Ahmedabad, Bangkok), values |
| `/memories` | Photo gallery |
| `/contact` | Form (route handler stub), map of offices, phone, email, WhatsApp |

Shared: header with magnetic CTA, footer, floating WhatsApp button, custom cursor, `sitemap.xml`, `robots.txt`, JSON-LD (`TravelAgency`, `TouristTrip`).

**Assumption:** the existing "Privilege" menu item is excluded from phase 1 because its content is unknown. Add a page if the client confirms what it is.

## 5. Signature features

1. **Petal preloader.** A plumeria flower (SVG) blooms open via GSAP timeline, then the overlay lifts to reveal the page. Shown once per session; skipped for reduced motion. Must not block content for SEO (content is in the server HTML; the overlay is purely visual and times out).
2. **Scroll-pinned hero journey.** A full-screen pinned section. Scroll scrubs through four scenes: backwaters, tea hills, beach, Kochi. A WebGL canvas (three.js) renders the scenes as full-screen image planes with a custom shader: rippling-water distortion on the backwaters scene and a scroll-scrubbed displacement crossfade between scenes. Copy per scene is HTML over the canvas, revealed by SplitText. Fallback when WebGL is unavailable, on low-end mobile, or with reduced motion: layered `next/image` photos with CSS/GSAP parallax crossfades. The server HTML always contains the fallback images and copy.
3. **Drifting petals.** Instanced petal meshes in the same WebGL canvas as the hero (one draw call), falling with gentle spin and attracted to the cursor. Capped count, paused when off-screen or tab hidden, disabled on reduced motion. Outside the hero, a light 2D canvas version is used, or none.
4. **Destination explorer.** Horizontal-scroll, pinned card gallery on the home page. Clicking a card uses GSAP Flip to expand it into the full-bleed destination page (shared-element transition). Direct navigation to a destination URL works without the transition.
5. **Interactive Kerala map.** A custom SVG of Kerala with a route path drawn by DrawSVG as the user scrolls. Pins for Munnar, Alleppey, Kovalam, Thekkady (more optional) pop in as the line reaches them, each with a mini card linking to its destination.
6. **Typography and motion language.** Editorial serif display type, SplitText line/word reveals, magnetic buttons, custom cursor with hover states, Lenis smooth scroll.
7. **Packages filter.** Domestic/International tabs and holiday-type chips; cards reflow with Flip.

## 6. Visual design

- **Palette (tokens):** cream background `#FBF6EC`, deep teal `#0F4C4A`, backwater green `#1F7A63`, coral `#F2766B`, gold `#E8B04B`, ink `#142321`. Petal gradient (white to yellow to coral) used as the brand motif.
- **Type:** display serif (for example Fraunces or Playfair Display) with a clean sans body (for example Inter or Manrope), loaded via `next/font`.
- **Imagery:** placeholders from a curated set of free-licensed Kerala photography (to be confirmed and attributed where required), replaced later by client assets.
- **Logo:** recreated as an SVG plumeria mark as a stand-in. Replace with the official file when supplied.

## 7. Architecture

```
src/
  app/                      routes, layouts, metadata, route handlers
    api/inquiry/route.ts    contact form stub
  components/
    ui/                     buttons, cards, section shells (server components)
    motion/                 client components: Preloader, HeroJourney, Petals,
                            DestinationExplorer, KeralaMap, Cursor, SmoothScroll,
                            Magnetic, SplitReveal
  lib/
    gsap.ts                 single place that registers plugins (client only)
    data/                   typed content + accessors: getDestinations(),
                            getPackages(), getHolidayTypes(), getOffices()
  content/                  destinations, packages, etc. as typed TS/JSON
  styles/                   tokens, globals
```

Principles:

- **Server by default.** All text content, SEO, and layout render on the server. Only animated pieces are client components ("islands"), each small and self-contained, with a single clear interface (props in, DOM animation out).
- **GSAP only through `useGSAP`** so every tween and ScrollTrigger is scoped and cleaned up on unmount and route change.
- **One animation bootstrap.** `SmoothScroll` mounts Lenis and wires `lenis.on('scroll', ScrollTrigger.update)` and the GSAP ticker; all components share it.
- **Data layer is the seam.** Components never import content files directly; they call `lib/data`. Phase 2 (AI, CMS) swaps these accessors without UI changes.
- **Dynamic imports** for heavy islands below the fold (map, explorer) to keep initial JS small.

## 8. Performance and accessibility

- Animate only `transform` and `opacity`; avoid layout-thrashing properties.
- Lazy-load below-fold images and islands; priority-load the hero image only.
- Mobile: reduced layers, fewer petals, no custom cursor, simpler explorer (native scroll-snap if pinned horizontal scroll is janky).
- `prefers-reduced-motion`: no preloader, no pinning, no petals, instant reveals.
- Keyboard-reachable navigation and CTAs, visible focus states, semantic landmarks, alt text, color contrast checked on teal/cream and coral/ink pairings.
- Custom cursor is decorative only and never replaces the system cursor on touch or reduced-motion.

## 9. Content model (typed)

- `Destination`: slug, name, region (domestic/international), tagline, story, highlights[], bestTime, hero image, coordinates (for map where relevant).
- `Package`: slug, title, destinationSlug(s), region, durationDays, holidayTypes[], priceFrom (optional), summary, itinerary[] (day, title, blurb), inclusions[], image.
- `HolidayType`: slug, name, blurb, image.
- `Office`: city, role (HQ/branch/international), contact.

Seed content comes from the destinations and services visible on the current site; package details not present there are written as plausible placeholder copy and flagged in the content files for client review.

## 10. Error handling

- Contact route handler validates input (zod) and returns a typed success or error response; the form shows inline errors and a success state. Honeypot field for basic spam protection.
- Missing slug returns Next `notFound()` with a styled 404 page.
- If JS fails or is slow, pages remain readable (content is server-rendered; animation states are applied by JS, with a `no-js`-safe default where practical).

## 11. Testing and verification

- `next build` and ESLint clean.
- Unit tests (Vitest) for the data accessors and the inquiry validator.
- Manual browser verification of each signature feature on desktop and a mobile viewport, including route changes (ScrollTrigger cleanup) and reduced-motion.
- Lighthouse run against the production build for the success-criteria scores.

## 12. Risks and mitigations

- **Shared-element transitions across App Router navigation** are tricky. Mitigation: Flip within the home page explorer plus an overlay that persists through the route change; fall back to a clean fade if it misbehaves. Direct loads always work.
- **ScrollTrigger and Lenis with route changes.** Mitigation: central bootstrap, `ScrollTrigger.refresh()` after navigation and image load, kill triggers on unmount via `useGSAP`.
- **Custom Kerala SVG.** No off-the-shelf asset; I will hand-build a simplified outline and route paths. Accuracy is stylistic, not cartographic.
- **Performance on low-end phones.** Mitigation: the mobile degradations in section 8 and dynamic imports.
- **WebGL bundle and GPU cost.** three.js adds roughly 150KB+ gzipped. Mitigation: hero canvas is dynamically imported after first paint, DPR capped at 1.5, render loop paused when the hero is off-screen, and capability detection picks the image fallback on weak devices.
- **Placeholder imagery and logo** may differ from the client brand. Mitigation: all assets isolated in `public/` and referenced through the content layer.

## 13. Phase 2 hooks (not built now)

`lib/data` accessors become the grounding source for the AI trip planner, chat concierge, and vibe search. The inquiry route handler becomes the lead-scoring entry point. The header and floating WhatsApp button reserve space for a chat launcher.

## 14. Open items

- Meaning of "Privilege" (excluded for now).
- Official logo, brand colors, and photography (placeholders used meanwhile).
