import { test, expect } from "vitest";
import { isSpam, MIN_FILL_MS, validateInquiry } from "@/lib/inquiry";

const good = { name: "Asha", phone: "+91 98765 43210", email: "asha@example.com", message: "Honeymoon in Dec", website: "" };

test("accepts valid input", () => {
  expect(validateInquiry(good).ok).toBe(true);
});
test("email optional", () => {
  expect(validateInquiry({ ...good, email: "" }).ok).toBe(true);
});
test("rejects empty name and bad phone with field errors", () => {
  const r = validateInquiry({ ...good, name: " ", phone: "abc" });
  expect(r.ok).toBe(false);
  if (!r.ok) { expect(r.errors.name).toBeDefined(); expect(r.errors.phone).toBeDefined(); }
});
test("spam check: filled honeypot or a form sent too fast", () => {
  const now = 1_000_000;
  const human = { ...good, startedAt: String(now - 10_000) };
  expect(isSpam(human, now)).toBe(false);
  expect(isSpam({ ...human, website: "http://spam" }, now)).toBe(true);
  expect(isSpam({ ...human, startedAt: String(now - MIN_FILL_MS + 1) }, now)).toBe(true);
  expect(isSpam({ ...good, startedAt: undefined }, now)).toBe(true); // posted without loading the form
  expect(isSpam(null, now)).toBe(false); // left to validation
});
test("honeypot and timestamp never reach the validated data", () => {
  const r = validateInquiry({ ...good, startedAt: "123" });
  expect(r.ok && Object.keys(r.data)).not.toContain("website");
  expect(r.ok && Object.keys(r.data)).not.toContain("startedAt");
});
test("rejects non-object", () => {
  expect(validateInquiry(null).ok).toBe(false);
  expect(validateInquiry("x").ok).toBe(false);
});
