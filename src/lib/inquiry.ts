import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]).optional(),
  message: z.string().trim().max(2000).optional(),
  packageSlug: z.string().optional(),
});
export type Inquiry = z.infer<typeof inquirySchema>;

/** People take a few seconds to fill the form; bots post it instantly. */
export const MIN_FILL_MS = 3000;

/**
 * Bot check, run before validation: the hidden `website` field is filled, or the form was sent faster than a person
 * could (`startedAt` is stamped when the form renders). Callers should answer spam with a normal success so bots
 * learn nothing, and simply not deliver it.
 */
export function isSpam(input: unknown, now = Date.now()): boolean {
  if (!input || typeof input !== "object") return false; // left to validation
  const { website, startedAt } = input as { website?: unknown; startedAt?: unknown };
  if (typeof website === "string" && website.trim() !== "") return true;
  const started = Number(startedAt);
  return !Number.isFinite(started) || now - started < MIN_FILL_MS;
}

export function validateInquiry(input: unknown):
  | { ok: true; data: Inquiry }
  | { ok: false; errors: Record<string, string> } {
  const r = inquirySchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
  return { ok: false, errors };
}
