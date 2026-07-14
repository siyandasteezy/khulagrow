import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * Public ingestion endpoint for hardware sensors. No user session —
 * authenticated by the sensor's API key (Authorization: Bearer kgs_…
 * or an x-api-key header). Readings land in the sensor's area.
 *
 * Accepts a single reading or an array of up to 500 (for sensors that
 * buffer while offline and upload in batches).
 */

const readingSchema = z
  .object({
    tempC: z.number().min(-50).max(80).optional(),
    humidity: z.number().min(0).max(100).optional(),
    ph: z.number().min(0).max(14).optional(),
    ec: z.number().nonnegative().max(20).optional(),
    co2Ppm: z.number().nonnegative().max(50_000).optional(),
    at: z.string().datetime({ offset: true }).optional(),
  })
  .refine(
    (r) => [r.tempC, r.humidity, r.ph, r.ec, r.co2Ppm].some((v) => v !== undefined),
    { message: "Reading must include at least one metric" }
  );

const bodySchema = z.union([readingSchema, z.array(readingSchema).min(1).max(500)]);

function keyFrom(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.headers.get("x-api-key");
}

export async function POST(req: Request) {
  const apiKey = keyFrom(req);
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API key — send it as 'Authorization: Bearer <key>'" },
      { status: 401 }
    );
  }

  const sensor = await prisma.sensor.findUnique({ where: { apiKey } });
  if (!sensor) {
    return NextResponse.json({ error: "Unknown API key" }, { status: 401 });
  }
  if (!sensor.active) {
    return NextResponse.json({ error: "Sensor is deactivated" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid reading" },
      { status: 400 }
    );
  }

  const readings = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
  const now = new Date();
  const [stored] = await prisma.$transaction([
    prisma.environmentReading.createMany({
      data: readings.map((r) => ({
        areaId: sensor.areaId,
        sensorId: sensor.id,
        tempC: r.tempC,
        humidity: r.humidity,
        ph: r.ph,
        ec: r.ec,
        co2Ppm: r.co2Ppm,
        at: r.at ? new Date(r.at) : now,
      })),
    }),
    prisma.sensor.update({ where: { id: sensor.id }, data: { lastSeenAt: now } }),
  ]);

  return NextResponse.json({ stored: stored.count }, { status: 201 });
}
