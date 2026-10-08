import type { Memory } from "@/lib/data/types";
const captions = [
  "Tea gardens of Munnar", "Sadya on a banana leaf", "Jew Street, Mattancherry", "Varkala cliffs at dusk",
  "Temple festival elephants", "Kumarakom backwaters", "Eravikulam hills", "Canoe on the backwaters",
];
export const memories: Memory[] = captions.map((caption, i) => ({ image: `/images/memory-${i + 1}.jpg`, caption }));
