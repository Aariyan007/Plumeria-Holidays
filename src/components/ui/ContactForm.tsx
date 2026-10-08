"use client";
import { useState } from "react";

type Errors = Record<string, string>;

export function ContactForm({ defaultMessage = "", packageSlug }: { defaultMessage?: string; packageSlug?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending"); setErrors({});
    const body = { ...Object.fromEntries(new FormData(e.currentTarget)), packageSlug };
    try {
      const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.ok) setStatus("sent");
      else { setErrors(json.errors ?? {}); setStatus("idle"); }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent")
    return (
      <div role="status" className="rounded-3xl bg-leaf p-10 text-cream">
        <h2 className="font-display text-4xl">Thank you!</h2>
        <p className="mt-3">Our team will call you within one working day.</p>
      </div>
    );

  const field = "w-full rounded-2xl border border-ink/20 bg-white/70 px-5 py-4 outline-none focus:border-plum";
  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="mt-1 text-sm text-pink-dark">{errors[k]}</p>;
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm">Name</label>
        <input id="name" name="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} autoComplete="name" />
        {err("name")}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm">Phone / WhatsApp</label>
          <input id="phone" name="phone" type="tel" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-err" : undefined} autoComplete="tel" />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm">Email (optional)</label>
          <input id="email" name="email" type="email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} autoComplete="email" />
          {err("email")}
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm">Tell us about your trip</label>
        <textarea id="message" name="message" rows={5} defaultValue={defaultMessage} className={field} />
        {err("message")}
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {errors.website && <p className="text-sm text-pink-dark">Something went wrong. Please call us instead.</p>}
      {status === "error" && <p role="alert" className="text-sm text-pink-dark">Couldn&apos;t send. Check your connection or WhatsApp us.</p>}
      <button disabled={status === "sending"} className="rounded-full bg-pink px-8 py-4 font-semibold text-ink transition-colors hover:bg-plum hover:text-cream disabled:opacity-60">
        {status === "sending" ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
