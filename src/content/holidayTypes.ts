import type { HolidayType } from "@/lib/data/types";
export const holidayTypes: HolidayType[] = [
  { slug: "honeymoon", name: "Honeymoon", blurb: "Private houseboats, hill-view suites and candlelit dinners.", image: "/images/type-honeymoon.jpg" },
  { slug: "family", name: "Family", blurb: "Easy pacing, kid-friendly stays and a driver who knows the way.", image: "/images/type-family.jpg" },
  { slug: "houseboat", name: "Houseboat", blurb: "Kettuvallam cruises through Alleppey and Kumarakom.", image: "/images/type-houseboat.jpg" },
  { slug: "adventure", name: "Adventure", blurb: "Treks, dives, rafting and jungle nights.", image: "/images/type-adventure.jpg" },
  { slug: "group", name: "Group Tours", blurb: "Escorted departures with Indian meals and a tour manager.", image: "/images/type-group.jpg" },
  { slug: "cruise", name: "Cruise", blurb: "Ocean liners, river cruises and Ha Long Bay junks.", image: "/images/type-cruise.jpg" },
];
