import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

const createSchema = z.object({
  farmId: z.string(),
  name: z.string().min(1),
  type: z.enum(["BLOCK", "TUNNEL", "ROOM", "GREENHOUSE", "FIELD"]),
  widthM: z.number().positive().optional(),
  lengthM: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
  beds: z.array(z.object({ name: z.string().min(1) })).optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await requireFarmRole(session, body.data.farmId, MANAGE_ROLES);

  const { beds, ...data } = body.data;
  const area = await prisma.area.create({
    data: { ...data, beds: beds ? { create: beds } : undefined },
    include: { beds: true },
  });

  await audit({
    userId: session.userId,
    farmId: data.farmId,
    action: "CREATE",
    entity: "Area",
    entityId: area.id,
    detail: { name: area.name, type: area.type },
  });

  return NextResponse.json(area, { status: 201 });
});
