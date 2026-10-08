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
export interface Circuit {
  id: string; label: string; title: string; packageSlug: string;
  /** short note per stop, keyed by the stop slug in circuitMaps */
  notes: Record<string, string>;
}
