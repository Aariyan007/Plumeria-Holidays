/** Stylised outline of Kerala in a 400x800 viewBox: coast on the left, Western Ghats on the right. */
export const KERALA_OUTLINE =
  "M70 30 C 95 25, 130 40, 150 60 C 175 90, 185 130, 200 170 C 215 210, 225 250, 240 300 C 255 345, 270 380, 280 420 C 290 470, 285 520, 275 570 C 262 620, 245 665, 220 710 C 205 740, 190 765, 175 780 C 165 760, 160 735, 150 700 C 140 655, 125 600, 112 545 C 100 490, 92 440, 85 390 C 78 330, 70 270, 62 210 C 55 150, 50 90, 70 30 Z";

/** Builds a smooth route through the stops in order. */
export function routeThrough(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i - 1], q = points[i];
    const mx = (p.x + q.x) / 2;
    d += ` C ${mx + 30} ${p.y}, ${mx - 30} ${q.y}, ${q.x} ${q.y}`;
  }
  return d;
}
