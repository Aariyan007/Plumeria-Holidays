import type { HolidayType } from "@/lib/data/types";
// From the Holiday Types menu on plumeriaholidays.com, plus the destinations they describe as honeymoon trips.
export const holidayTypes: HolidayType[] = [
  { slug: "group", name: "Group Tours", image: "/images/type-group.jpg",
    blurb: "Group departures from Kerala to Dubai, Thailand, Hong Kong & Macau, Malaysia, Singapore, Azerbaijan, Kashmir and the Golden Triangle.",
    destinationSlugs: ["dubai", "thailand", "hong-kong-macau", "malaysia", "singapore", "azerbaijan", "kashmir", "golden-triangle"] },
  { slug: "honeymoon", name: "Honeymoon", image: "/images/type-honeymoon.jpg",
    blurb: "Private resorts in the Maldives, the mountains of Manali, and Singapore after dark.",
    destinationSlugs: ["maldives", "shimla-kullu-manali", "singapore"] },
  { slug: "houseboat", name: "Houseboats", image: "/images/type-houseboat.jpg",
    blurb: "1 to 4 bedroom deluxe and luxury houseboats on the backwaters of Alappuzha, Kumarakom and Kollam.",
    destinationSlugs: ["alleppey"] },
  { slug: "cruise", name: "Cruises", image: "/images/type-cruise.jpg",
    blurb: "Cordelia Cruises from Kerala to the Lakshadweep islands.",
    destinationSlugs: ["lakshadweep"] },
];
