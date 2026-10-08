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
