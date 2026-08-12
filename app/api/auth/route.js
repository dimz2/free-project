import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = (await req.json()) || {};
  if (password && password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
