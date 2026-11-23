import { NextResponse } from "next/server";
import { PORTAIL_COOKIE } from "@/lib/portail-auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAIL_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
