export type Region = "domestic" | "international";
export type HolidayTypeSlug = "group" | "honeymoon" | "houseboat" | "cruise";

/** Content mirrors what Plumeria publishes on plumeriaholidays.com; optional fields are left out when they don't state them. */
export interface Destination {
  slug: string; name: string; region: Region; tagline: string; story: string;
  highlights: string[]; image: string; bestTime?: string;
}
export interface ItineraryDay {
  day: number; title: string; blurb: string;
  /** e.g. "Breakfast, Lunch, Dinner" */
  meals?: string;
  /** shown instead of "Day N" when the source gives an outline rather than numbered days */
  label?: string;
}
export interface Package {
  slug: string; title: string; destinationSlugs: string[]; region: Region; durationDays: number;
  holidayTypes: HolidayTypeSlug[]; priceFrom?: number; summary: string;
  itinerary: ItineraryDay[]; inclusions?: string[]; exclusions?: string[]; image: string; featured?: boolean;
}
export interface HolidayType {
  slug: HolidayTypeSlug; name: string; blurb: string; image: string;
  /** destinations offered under this type, including ones without a published itinerary */
  destinationSlugs: string[];
}
export interface Office { city: string; role: "HQ" | "Branch" | "International"; contact: string }
export interface Testimonial { name: string; trip: string; quote: string }
export type MemoryTag = "hills" | "backwaters" | "beaches" | "culture" | "food";
export interface Memory {
  image: string; caption: string; place: string; tag: MemoryTag;
  /** card shape in the masonry grid */
  shape: "portrait" | "landscape" | "square";
}
export interface HeroScene { id: string; kicker: string; title: string; image: string }
export interface Circuit {
  id: string; label: string; title: string; packageSlug: string;
  /** short note per stop, keyed by the stop slug in circuitMaps */
  notes: Record<string, string>;
}
