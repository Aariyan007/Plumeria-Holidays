export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function canUseWebGL(doc: Document = document): boolean {
  try {
    const c = doc.createElement("canvas") as HTMLCanvasElement;
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function isLowEndDevice(nav: Navigator = navigator): boolean {
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = (nav as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 && mem <= 4;
}
