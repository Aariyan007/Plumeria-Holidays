import type { Circuit } from "@/lib/data/types";

// Stop positions come from circuitMaps.ts (generated); notes here are keyed by stop slug and follow the published itineraries.
export const circuits: Circuit[] = [
  { id: "kashmir", label: "Kashmir", title: "Lakes, meadows and valleys in five days", packageSlug: "kashmir-5d",
    notes: { srinagar: "Mughal gardens and a shikara on Dal Lake", gulmarg: "Meadows and the gondola to the snow",
      pahalgam: "Saffron fields, Aru and Betaab Valley" } },
  { id: "golden-triangle", label: "Golden Triangle", title: "Delhi, the Taj Mahal and Jaipur", packageSlug: "golden-triangle-5d",
    notes: { delhi: "Qutub Minar, India Gate and Humayun's Tomb", agra: "The Taj Mahal at sunrise",
      jaipur: "Amber Fort, Hawa Mahal and City Palace" } },
  { id: "thailand", label: "Thailand", title: "Pattaya's islands to Bangkok's temples", packageSlug: "thailand-4d",
    notes: { pattaya: "Floating market and Tiger Park", "coral-island": "Half a day on Coral Island",
      "safari-world": "Safari World & Marine Park", bangkok: "Golden and Marble Buddha temples" } },
  { id: "vietnam", label: "Vietnam", title: "Saigon, the tunnels and the Mekong", packageSlug: "vietnam-5d",
    notes: { "ho-chi-minh-city": "Landmarks, walking street and a dinner cruise", "cu-chi": "The Cu Chi Tunnels",
      "ben-tre": "Sampan ride in the Mekong Delta" } },
  { id: "bali", label: "Bali", title: "Beaches, temples and Nusa Penida", packageSlug: "bali-5d",
    notes: { kuta: "Sunset at Kuta Beach", uluwatu: "Clifftop temple and Kecak fire dance", ubud: "Ubud Palace and art villages",
      kintamani: "Volcano views and the rice terraces", "nusa-penida": "Kelingking Beach by speedboat" } },
];
