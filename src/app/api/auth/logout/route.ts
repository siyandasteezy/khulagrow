import { NextResponse } from "next/server";
import { destroySession, handler } from "@/lib/auth";

export const POST = handler(async () => {
  await destroySession();
  return NextResponse.json({ ok: true });
});
