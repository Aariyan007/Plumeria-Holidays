import { NextResponse } from "next/server";
import { validateInquiry } from "@/lib/inquiry";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const r = validateInquiry(body);
  if (!r.ok) return NextResponse.json(r, { status: 400 });
  // Phase 2: deliver by email / CRM and lead scoring. For now, log server-side.
  console.info("[inquiry]", { name: r.data.name, packageSlug: r.data.packageSlug });
  return NextResponse.json({ ok: true });
}
