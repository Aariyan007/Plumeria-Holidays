import type { Package } from "@/lib/data/types";

// Itineraries as published on plumeriaholidays.com/Package/*. Prices are not published, so none are shown.
// Inclusions/exclusions only where the source states them (or the day plan states them explicitly).
const BLD = "Breakfast, Lunch, Dinner";

export const packages: Package[] = [
  { slug: "golden-triangle-5d", title: "Delhi, Agra & Jaipur", destinationSlugs: ["golden-triangle"], region: "domestic", durationDays: 5, route: ["Delhi", "Agra", "Jaipur"],
    holidayTypes: ["group"], featured: true, image: "/images/golden-triangle.jpg",
    summary: "The Golden Triangle from Kochi: Delhi's monuments, the Taj Mahal at sunrise and the forts and palaces of Jaipur.",
    itinerary: [
      { day: 1, title: "Cochin to Delhi", meals: "Lunch, Dinner", blurb: "Met at the airport, check in, and visit Qutub Minar in the afternoon. Evening shopping, overnight in Delhi." },
      { day: 2, title: "Delhi to Agra", meals: BLD, blurb: "India Gate, Parliament House and President House (outside), Jama Masjid, Humayun's Tomb, Lotus Temple, Raj Ghat and the Indira Gandhi Museum, then on to Agra." },
      { day: 3, title: "Agra to Jaipur", meals: BLD, blurb: "The Taj Mahal at sunrise and Itmad-ud-Daulah's tomb, then drive to Jaipur for the night." },
      { day: 4, title: "Jaipur", meals: "Breakfast", blurb: "Hawa Mahal, City Palace, Jal Mahal and Jantar Mantar, with an elephant ride up to Amber Fort." },
      { day: 5, title: "Return to Cochin", meals: "Breakfast", blurb: "Check out, a last round of Jaipur sightseeing, and fly home from Jaipur airport." },
    ],
    inclusions: ["Airport reception", "Hotel stays", "Transfers between cities", "Sightseeing as listed", "Meals as per day plan"],
    exclusions: ["Lunch on Day 5"] },

  { slug: "kashmir-5d", title: "Kashmir", destinationSlugs: ["kashmir"], region: "domestic", durationDays: 5, route: ["Srinagar", "Gulmarg", "Pahalgam"],
    holidayTypes: ["group"], image: "/images/kashmir.jpg",
    summary: "Srinagar, Gulmarg and Pahalgam, with a shikara ride on Dal Lake.",
    itinerary: [
      { day: 1, title: "Kochi to Srinagar", meals: "Dinner", blurb: "Arrive in Srinagar, visit the Mughal gardens, and take an evening shikara ride on Dal Lake." },
      { day: 2, title: "Gulmarg", meals: BLD, blurb: "A day in Gulmarg, with an optional cable car to Khilanmarg or Apharwat snow point. Overnight in Gulmarg." },
      { day: 3, title: "Pahalgam", meals: BLD, blurb: "Drive to Pahalgam past a cricket-bat factory, saffron fields and the Awantipura ruins; optional Aru, Betaab Valley or Chandanwari." },
      { day: 4, title: "Pahalgam to Srinagar", meals: BLD, blurb: "Optional Chandanwari and Betaab Valley in the morning, a free evening, then back to Srinagar." },
      { day: 5, title: "Departure", meals: "Breakfast, Lunch", blurb: "Transfer to Srinagar airport for your flight home." },
    ],
    inclusions: ["Hotel stays in Srinagar, Gulmarg & Pahalgam", "Meals as per day plan", "Airport transfers"],
    exclusions: ["Gulmarg cable car & pony rides", "Ponies / local transport to Aru, Betaab Valley & Chandanwari"] },

  { slug: "thailand-4d", title: "Thailand", destinationSlugs: ["thailand"], region: "international", durationDays: 4, route: ["Pattaya", "Coral Island", "Bangkok"],
    holidayTypes: ["group"], featured: true, image: "/images/thailand.jpg",
    summary: "Pattaya and Bangkok: Coral Island, Safari World and the Buddha temples, with all meals.",
    itinerary: [
      { day: 1, title: "Cochin to Bangkok (DMK), then Pattaya", meals: BLD, blurb: "Airport pickup, check in, then Pattaya Floating Market, Tiger Park and Terminal 21." },
      { day: 2, title: "Pattaya", meals: BLD, blurb: "Half-day Coral Island tour, free time, then an evening city tour with the Gems Gallery and a viewpoint." },
      { day: 3, title: "Pattaya to Bangkok", meals: BLD, blurb: "Safari World & Marine Park (entry and lunch included), then transfer to Bangkok." },
      { day: 4, title: "Bangkok", meals: BLD, blurb: "City tour with the Golden Buddha and Marble Buddha temples, shopping at Indira Market, then the airport." },
    ],
    inclusions: ["Hotel stays", "All meals as listed", "Guide on arrival", "Safari World entry"] },

  { slug: "vietnam-5d", title: "Vietnam", destinationSlugs: ["vietnam"], region: "international", durationDays: 5, route: ["Ho Chi Minh City", "Cu Chi", "Ben Tre"],
    holidayTypes: [], featured: true, image: "/images/vietnam.jpg",
    summary: "Ho Chi Minh City, the Cu Chi Tunnels and a day in the Mekong Delta.",
    itinerary: [
      { day: 1, title: "Kochi to Ho Chi Minh City", meals: BLD, blurb: "Met by your guide and driver, time to rest or explore, then a dinner cruise." },
      { day: 2, title: "Ho Chi Minh City", meals: BLD, blurb: "Notre-Dame Cathedral, Saigon Central Post Office, Reunification Palace, War Remnants Museum and the Cu Chi Tunnels." },
      { day: 3, title: "Ho Chi Minh City", meals: BLD, blurb: "City tour, then an evening on the walking street." },
      { day: 4, title: "Ben Tre and the Mekong Delta", meals: BLD, blurb: "Drive to Ben Tre for Turtle Island, a coconut-candy workshop and a sampan ride." },
      { day: 5, title: "Departure", meals: "Breakfast", blurb: "Check out, some shopping, then transfer to the airport (lunch on your own)." },
    ],
    inclusions: ["Hotel stays", "Meals as per day plan", "Airport transfers with guide & driver"] },

  { slug: "bali-5d", title: "Bali", destinationSlugs: ["bali"], region: "international", durationDays: 5, route: ["Kuta", "Uluwatu", "Ubud", "Nusa Penida"],
    holidayTypes: [], image: "/images/bali.jpg",
    summary: "Kuta, Uluwatu's Kecak fire dance, Ubud and Kintamani, and a speedboat day on Nusa Penida.",
    itinerary: [
      { day: 1, title: "Arrival, Kuta Beach & art", blurb: "Airport welcome and hotel transfer, then sunset at Kuta Beach, the Kuta Art Museum and the art market." },
      { day: 2, title: "Benoa Beach, Uluwatu Temple & Kecak dance", blurb: "Water sports at Benoa Beach, the clifftop Uluwatu Temple, and the Kecak fire dance at sunset." },
      { day: 3, title: "Ubud, Kintamani & rice terraces", blurb: "Art villages and Ubud Palace, the Kintamani viewpoint, a Luwak coffee plantation and the Tegalalang rice terraces." },
      { day: 4, title: "Nusa Penida", meals: "Breakfast, Lunch", blurb: "Speedboat from Sanur to Nusa Penida for Kelingking Beach, Angel's Billabong and Broken Beach." },
      { day: 5, title: "Departure", meals: "Breakfast", blurb: "Check out and transfer to Bali International Airport." },
    ],
    inclusions: ["Hotel stays", "Daily breakfast", "Selected lunches & dinners", "Private airport transfers & sightseeing transport", "Guided sightseeing", "Entry tickets & cultural shows", "Taxes"],
    exclusions: ["International airfare", "Visa & travel insurance", "Personal expenses & optional activities", "Tips and meals not mentioned"] },

  { slug: "dubai-5d", title: "Dazzling Dubai", destinationSlugs: ["dubai"], region: "international", durationDays: 5, route: ["Abu Dhabi", "Dubai", "Sharjah"],
    holidayTypes: ["group"], image: "/images/dubai.jpg",
    summary: "Abu Dhabi, Dubai and Sharjah: Burj Khalifa, a dhow cruise, a desert safari and Global Village.",
    itinerary: [
      { day: 1, title: "Abu Dhabi", meals: BLD, blurb: "Arrive in Abu Dhabi for a city tour: Heritage Village, Yas Island, the Grand Mosque and Emirates Palace." },
      { day: 2, title: "Dubai city tour", meals: BLD, blurb: "Dubai's sights, Burj Khalifa and Dubai Mall, then a dhow cruise dinner." },
      { day: 3, title: "Dolphins & desert safari", meals: BLD, blurb: "A dolphin and seal show, then a desert safari with BBQ dinner." },
      { day: 4, title: "Miracle Garden & Global Village", meals: BLD, blurb: "Dubai Miracle Garden and Global Village." },
      { day: 5, title: "Sharjah & departure", meals: BLD, blurb: "Shopping and a Sharjah city tour, then Sharjah Airport." },
    ] },

  { slug: "azerbaijan-6d", title: "Azerbaijan", destinationSlugs: ["azerbaijan"], region: "international", durationDays: 6, route: ["Baku", "Gabala", "Gobustan"],
    holidayTypes: ["group"], featured: true, image: "/images/azerbaijan.jpg",
    summary: "Baku, Gabala's mountain lakes, Gobustan's mud volcanoes and the fire mountain of Yanardag.",
    itinerary: [
      { day: 1, title: "Arrival & Baku by night", meals: "Dinner", blurb: "Airport pickup, check in, and a night tour of Baku." },
      { day: 2, title: "Baku city tour", meals: BLD, blurb: "Old City walking tour, the Baku Eye and boating at Little Venice." },
      { day: 3, title: "Gabala", meals: BLD, blurb: "Shamakhi Juma Mosque, Nohur Lake, Yeddi Gozel waterfalls and the Tufandag cable car." },
      { day: 4, title: "Gobustan", meals: BLD, blurb: "Rock petroglyphs, mud volcanoes and the Petroglyph Museum, then a gala dinner." },
      { day: 5, title: "Absheron Peninsula", meals: BLD, blurb: "Yanardag fire mountain and the Ateshgah Fire Temple, then Park Boulevard." },
      { day: 6, title: "Departure", meals: "Breakfast, Lunch", blurb: "Check out and airport drop." },
    ] },

  { slug: "hong-kong-macau-5d", title: "Hong Kong & Macau", destinationSlugs: ["hong-kong-macau"], region: "international", durationDays: 5, route: ["Macau", "Hong Kong"],
    holidayTypes: ["group"], featured: true, image: "/images/hong-kong-macau.jpg",
    summary: "Macau's heritage, Victoria Peak by night, a day at Disneyland and a day at Ocean Park.",
    itinerary: [
      { day: 1, title: "Hong Kong to Macau", meals: "Lunch, Dinner", blurb: "Arrive in Hong Kong, ferry to Macau, and tour Macau's main sights." },
      { day: 2, title: "Macau to Hong Kong", meals: BLD, blurb: "Ferry back to Hong Kong, a free afternoon, then Victoria Peak, the Star Ferry and the Symphony of Lights." },
      { day: 3, title: "Hong Kong Disneyland", meals: "Breakfast, plus park meal coupon", blurb: "A full day at Disneyland, with the afternoon parade and evening fireworks." },
      { day: 4, title: "Ocean Park", meals: BLD, blurb: "A day of animal exhibits, rides and marine shows." },
      { day: 5, title: "Departure", meals: "Breakfast", blurb: "Check out and transfer to the airport." },
    ] },

  { slug: "malaysia-5d", title: "Malaysia", destinationSlugs: ["malaysia"], region: "international", durationDays: 5, route: ["Kuala Lumpur", "Langkawi"],
    holidayTypes: ["group"], featured: true, image: "/images/malaysia.jpg",
    summary: "Kuala Lumpur's landmarks, then Langkawi's beaches, cable car and islands.",
    itinerary: [
      { day: 1, label: "Start", title: "Arrival & Kuala Lumpur", blurb: "Arrive and tour Kuala Lumpur's major landmarks." },
      { day: 2, label: "Middle", title: "Langkawi", blurb: "Beaches, the cable car, viewpoints, island hopping and time at leisure." },
      { day: 3, label: "End", title: "Shopping & return", blurb: "Shopping, some local exploring, and the trip home." },
    ],
    inclusions: ["Return flights with baggage", "Hotels in Kuala Lumpur & Langkawi", "Daily breakfast & selected meals", "Airport transfers & local transport", "Sightseeing & entry tickets as listed", "Tour assistance"] },

  { slug: "hyderabad-3d", title: "Hyderabad", destinationSlugs: ["hyderabad"], region: "domestic", durationDays: 3, route: ["Hyderabad", "Ramoji Film City"],
    holidayTypes: [], image: "/images/hyderabad.jpg",
    summary: "Charminar, Golconda Fort, Hussain Sagar and a full day at Ramoji Film City.",
    itinerary: [
      { day: 1, title: "Kochi to Hyderabad", meals: "Lunch, Dinner", blurb: "Charminar, Birla Mandir and Golconda Fort, then Lumbini Park and boating on Hussain Sagar." },
      { day: 2, title: "Ramoji Film City", meals: BLD, blurb: "A full day at Ramoji Film City." },
      { day: 3, title: "Salar Jung Museum & Mecca Masjid", meals: "Breakfast, Lunch", blurb: "Check out, visit the museum and mosque, some shopping, then the airport." },
    ],
    inclusions: ["Hotel stays", "Meals as per day plan"] },
];
