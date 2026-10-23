import type { Memory, MemoryTag } from "@/lib/data/types";

// PLACEHOLDER photos from Wikimedia Commons. Swap in travellers' own photos (with their consent):
// drop the file in public/images and add an entry here.
export const memories: Memory[] = [
  { image: "/images/memory-1.jpg", caption: "Harvest day in the tea hills", place: "Munnar", tag: "hills", shape: "portrait" },
  { image: "/images/memory-2.jpg", caption: "Sadya on a banana leaf", place: "Kerala", tag: "food", shape: "square" },
  { image: "/images/memory-3.jpg", caption: "Jew Street, Mattancherry", place: "Kochi", tag: "culture", shape: "landscape" },
  { image: "/images/memory-4.jpg", caption: "Varkala cliffs at dusk", place: "Varkala", tag: "beaches", shape: "portrait" },
  { image: "/images/memory-5.jpg", caption: "Temple festival elephants", place: "Thrissur", tag: "culture", shape: "landscape" },
  { image: "/images/memory-6.jpg", caption: "Slow mornings on the backwaters", place: "Kumarakom", tag: "backwaters", shape: "square" },
  { image: "/images/memory-7.jpg", caption: "Eravikulam hills", place: "Munnar", tag: "hills", shape: "portrait" },
  { image: "/images/memory-8.jpg", caption: "Canoe on the backwaters", place: "Alleppey", tag: "backwaters", shape: "landscape" },
];

export const memoryTags: { slug: MemoryTag; label: string }[] = [
  { slug: "hills", label: "Hills" },
  { slug: "backwaters", label: "Backwaters" },
  { slug: "beaches", label: "Beaches" },
  { slug: "culture", label: "Culture" },
  { slug: "food", label: "Food" },
];
