import { NextResponse } from "next/server";
import { isSpam, validateInquiry } from "@/lib/inquiry";

// A real enquiry is a few hundred bytes; refuse anything far bigger before parsing it.
const MAX_BODY = 8 * 1024;

export async function POST(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY)
    return NextResponse.json({ ok: false, errors: { form: "Message too long" } }, { status: 413 });
  const text = await req.text();
  if (text.length > MAX_BODY) return NextResponse.json({ ok: false, errors: { form: "Message too long" } }, { status: 413 });
  const body = (() => { try { return JSON.parse(text); } catch { return null; } })();
  if (isSpam(body)) {
    // Looks like success to the bot; nothing is delivered.
    console.info("[inquiry] dropped as spam");
    return NextResponse.json({ ok: true });
  }
  const r = validateInquiry(body);
  if (!r.ok) return NextResponse.json(r, { status: 400 });
  // Phase 2: deliver by email / CRM and lead scoring. For now, log server-side.
  console.info("[inquiry]", { name: r.data.name, packageSlug: r.data.packageSlug });
  return NextResponse.json({ ok: true });
}
