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
