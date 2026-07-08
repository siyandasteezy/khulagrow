import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

const addSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "MANAGER", "SUPERVISOR", "INSPECTOR", "WORKER"]),
});

export const POST = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;
  await requireFarmRole(session, id, MANAGE_ROLES);

  const body = addSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.data.email.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json(
      { error: "No user with that email — ask them to register first" },
      { status: 404 }
    );
  }

  const member = await prisma.farmMember.upsert({
    where: { userId_farmId: { userId: user.id, farmId: id } },
    create: { userId: user.id, farmId: id, role: body.data.role },
    update: { role: body.data.role },
  });

  await audit({
    userId: session.userId,
    farmId: id,
    action: "CREATE",
    entity: "FarmMember",
    entityId: member.id,
    detail: { email: body.data.email, role: body.data.role },
  });

  return NextResponse.json(member, { status: 201 });
});

const removeSchema = z.object({ userId: z.string() });

export const DELETE = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;
  await requireFarmRole(session, id, MANAGE_ROLES);

  const body = removeSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (body.data.userId === session.userId) {
    return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
  }

  await prisma.farmMember.delete({
    where: { userId_farmId: { userId: body.data.userId, farmId: id } },
  });

  await audit({
    userId: session.userId,
    farmId: id,
    action: "DELETE",
    entity: "FarmMember",
    detail: { removedUserId: body.data.userId },
  });

  return NextResponse.json({ ok: true });
});
