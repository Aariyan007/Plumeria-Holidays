import type { Circuit } from "@/lib/data/types";

// Stop positions come from circuitMaps.ts (generated); notes here are keyed by stop slug.
export const circuits: Circuit[] = [
  { id: "kerala", label: "Kerala", title: "From the hills to the sea, in one journey", packageSlug: "kerala-classic-6d",
    notes: { wayanad: "Forests, caves and coffee", kochi: "Where the spice routes began", munnar: "Mist, tea and mountain air",
      thekkady: "Spice trails and wild elephants", alleppey: "A night on the backwaters", kovalam: "Crescent beaches at land's end" } },
  { id: "thailand", label: "Thailand", title: "Temples, islands and street food", packageSlug: "thailand-group-6d",
    notes: { "chiang-mai": "Old city temples and night bazaars", bangkok: "Grand Palace and river cruises", pattaya: "Coral Island by speedboat",
      phuket: "Long-tail boats to Phi Phi", krabi: "Limestone cliffs and lagoons" } },
  { id: "bali", label: "Bali", title: "Rice terraces to clifftop sunsets", packageSlug: "bali-escape-6d",
    notes: { seminyak: "Beach clubs and sunsets", ubud: "Jungle swings and terraces", kintamani: "Volcano views over coffee",
      "nusa-penida": "Kelingking cliffs", uluwatu: "Temple and Kecak fire dance" } },
  { id: "vietnam", label: "Vietnam", title: "Bays, lanterns and pho", packageSlug: "vietnam-discovery-7d",
    notes: { hanoi: "Old Quarter food walk", "ha-long": "Overnight cruise among karsts", "hoi-an": "Golden Bridge and lantern nights",
      saigon: "Markets and the Mekong" } },
  { id: "europe", label: "Europe", title: "The grand tour, escorted", packageSlug: "europe-grand-tour-10d",
    notes: { paris: "Eiffel Tower and the Seine", lucerne: "Mt Titlis and Top of Europe", venice: "Gondolas at golden hour",
      florence: "Duomo and the Leaning Tower", rome: "Colosseum and the Vatican" } },
];
