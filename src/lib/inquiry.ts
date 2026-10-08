import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]).optional(),
  message: z.string().trim().max(2000).optional(),
  packageSlug: z.string().optional(),
  website: z.string().max(0, "Spam detected").optional(), // honeypot
});
export type Inquiry = z.infer<typeof inquirySchema>;

export function validateInquiry(input: unknown):
  | { ok: true; data: Inquiry }
  | { ok: false; errors: Record<string, string> } {
  const r = inquirySchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
  return { ok: false, errors };
}
