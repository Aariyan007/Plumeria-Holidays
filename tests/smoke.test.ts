import { site } from "@/lib/site";
import { test, expect } from "vitest";
test("site constants", () => {
  expect(site.whatsapp).toBe("https://wa.me/919048833330");
});
