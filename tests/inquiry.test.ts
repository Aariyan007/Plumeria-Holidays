import { test, expect } from "vitest";
import { validateInquiry } from "@/lib/inquiry";

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
test("rejects filled honeypot", () => {
  const r = validateInquiry({ ...good, website: "http://spam" });
  expect(r.ok).toBe(false);
});
test("rejects non-object", () => {
  expect(validateInquiry(null).ok).toBe(false);
  expect(validateInquiry("x").ok).toBe(false);
});
