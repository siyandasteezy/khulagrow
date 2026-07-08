import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, handler } from "@/lib/auth";
import { trialEnd } from "@/lib/billing";
import { audit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = body.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: body.data.name,
      phone: body.data.phone,
      passwordHash: await hashPassword(body.data.password),
      trialEndsAt: trialEnd(), // 3-day free trial starts now
    },
  });

  await createSession(user);
  await audit({ userId: user.id, action: "CREATE", entity: "User", entityId: user.id });

  return NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name } },
    { status: 201 }
  );
});
