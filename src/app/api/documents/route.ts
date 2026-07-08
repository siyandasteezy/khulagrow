import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  if (farmId) await requireFarmRole(session, farmId, ALL_ROLES);

  const docs = await prisma.document.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: { farm: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
});

const createSchema = z.object({
  farmId: z.string(),
  type: z.enum(["LICENCE", "SOP", "CERTIFICATE", "PERMIT", "LAB_RESULT", "INSURANCE", "OTHER"]),
  title: z.string().min(1),
  fileUrl: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await requireFarmRole(session, body.data.farmId, MANAGE_ROLES);

  const doc = await prisma.document.create({
    data: {
      ...body.data,
      expiryDate: body.data.expiryDate ? new Date(body.data.expiryDate) : undefined,
      uploadedById: session.userId,
    },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "Document",
    entityId: doc.id,
    detail: { title: doc.title, type: doc.type },
  });

  return NextResponse.json(doc, { status: 201 });
});
