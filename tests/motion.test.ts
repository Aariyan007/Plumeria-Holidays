import { test, expect } from "vitest";
import { canUseWebGL, isLowEndDevice } from "@/lib/motion";

test("canUseWebGL false when no context", () => {
  const doc = { createElement: () => ({ getContext: () => null }) } as unknown as Document;
  expect(canUseWebGL(doc)).toBe(false);
});
test("canUseWebGL true when webgl2 context", () => {
  const doc = { createElement: () => ({ getContext: (k: string) => (k === "webgl2" ? {} : null) }) } as unknown as Document;
  expect(canUseWebGL(doc)).toBe(true);
});
test("canUseWebGL false on throw", () => {
  const doc = { createElement: () => { throw new Error("x"); } } as unknown as Document;
  expect(canUseWebGL(doc)).toBe(false);
});
test("isLowEndDevice", () => {
  expect(isLowEndDevice({ hardwareConcurrency: 2, deviceMemory: 2 } as unknown as Navigator)).toBe(true);
  expect(isLowEndDevice({ hardwareConcurrency: 8, deviceMemory: 8 } as unknown as Navigator)).toBe(false);
  expect(isLowEndDevice({ hardwareConcurrency: 8 } as unknown as Navigator)).toBe(false);
});
