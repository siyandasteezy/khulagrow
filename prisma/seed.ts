/**
 * Demo seed: one licensed farm with realistic seed-to-harvest history.
 * Login: demo@khulagrow.co.za / demo1234
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const daysAgo = (n: number, h = 8) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d;
};
const daysAhead = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

async function main() {
  // Idempotent-ish: wipe demo data keyed on the demo user's farms.
  const existing = await prisma.user.findUnique({ where: { email: "demo@khulagrow.co.za" } });
  if (existing) {
    const farms = await prisma.farm.findMany({
      where: { members: { some: { userId: existing.id } } },
      select: { id: true },
    });
    await prisma.farm.deleteMany({ where: { id: { in: farms.map((f) => f.id) } } });
    await prisma.user.deleteMany({
      where: { email: { in: ["demo@khulagrow.co.za", "worker@khulagrow.co.za", "inspector@khulagrow.co.za"] } },
    });
  }
  await prisma.strain.deleteMany({});

  const password = await bcrypt.hash("demo1234", 10);
  const owner = await prisma.user.create({
    data: { email: "demo@khulagrow.co.za", name: "Thandi Nkosi", passwordHash: password, phone: "+27 82 000 0000" },
  });
  const worker = await prisma.user.create({
    data: { email: "worker@khulagrow.co.za", name: "Sipho Dlamini", passwordHash: password },
  });
  const inspector = await prisma.user.create({
    data: { email: "inspector@khulagrow.co.za", name: "Dr. Naledi Mokoena", passwordHash: password },
  });

  const farm = await prisma.farm.create({
    data: {
      name: "Highveld Cultivation Site A",
      licenceNumber: "SAHPRA/CUL/2025/0142",
      licenceExpiry: daysAhead(200),
      address: "Plot 42, R512, Broederstroom, North West",
      latitude: -25.79231,
      longitude: 27.85517,
      sizeHectares: 2.4,
      members: {
        create: [
          { userId: owner.id, role: "OWNER" },
          { userId: worker.id, role: "WORKER" },
          { userId: inspector.id, role: "INSPECTOR" },
        ],
      },
    },
  });

  const tunnel1 = await prisma.area.create({
    data: {
      farmId: farm.id, name: "Tunnel 1", type: "TUNNEL", widthM: 10, lengthM: 30, capacity: 400,
      beds: { create: [1, 2, 3, 4].map((n) => ({ name: `Bed ${n}`, widthM: 1.2, lengthM: 28 })) },
    },
  });
  const tunnel2 = await prisma.area.create({
    data: { farmId: farm.id, name: "Tunnel 2", type: "TUNNEL", widthM: 10, lengthM: 30, capacity: 400 },
  });
  const dryRoom = await prisma.area.create({
    data: { farmId: farm.id, name: "Drying Room", type: "ROOM", widthM: 6, lengthM: 8 },
  });
  const momRoom = await prisma.area.create({
    data: { farmId: farm.id, name: "Mother Room", type: "ROOM", widthM: 5, lengthM: 6, capacity: 40 },
  });

  const durban = await prisma.strain.create({
    data: { name: "Durban Poison", type: "SATIVA", genetics: "South African landrace", floweringDays: 63, thcPercent: 19, cbdPercent: 0.2 },
  });
  const cheese = await prisma.strain.create({
    data: { name: "Swazi Cheese", type: "HYBRID", genetics: "Swazi Gold × UK Cheese", floweringDays: 58, thcPercent: 17, cbdPercent: 0.5 },
  });
  await prisma.strain.create({
    data: { name: "CBD Charlotte", type: "HYBRID", genetics: "Charlotte's Web pheno", floweringDays: 60, thcPercent: 0.8, cbdPercent: 14 },
  });

  // Batch 1 — harvested Durban Poison (full lifecycle)
  const year = new Date().getFullYear();
  const b1 = await prisma.batch.create({
    data: {
      farmId: farm.id, code: `KG-${year}-001`, strainId: durban.id, source: "SEED",
      stage: "HARVESTED", plantCount: 180, areaId: tunnel1.id, startDate: daysAgo(140),
      events: {
        create: [
          { type: "STAGE_CHANGE", stage: "GERMINATION", note: "Batch started from seed", at: daysAgo(140), byUserId: owner.id },
          { type: "STAGE_CHANGE", stage: "SEEDLING", note: "Stage: GERMINATION → SEEDLING", at: daysAgo(130), byUserId: worker.id },
          { type: "STAGE_CHANGE", stage: "VEGETATIVE", note: "Stage: SEEDLING → VEGETATIVE", at: daysAgo(112), byUserId: worker.id },
          { type: "HEALTH_CHECK", health: "NEEDS_ATTENTION", note: "Slight N deficiency on lower leaves, adjusted feed", at: daysAgo(95), byUserId: worker.id },
          { type: "HEALTH_CHECK", health: "HEALTHY", note: "Recovered after feed adjustment", at: daysAgo(88), byUserId: worker.id },
          { type: "STAGE_CHANGE", stage: "FLOWERING", note: "Stage: VEGETATIVE → FLOWERING", at: daysAgo(70), byUserId: owner.id },
          { type: "STAGE_CHANGE", stage: "HARVESTED", note: "Harvested 176 plants, 42.5 kg wet", at: daysAgo(7), byUserId: owner.id },
        ],
      },
    },
  });

  // Batch 2 — flowering Swazi Cheese
  const b2 = await prisma.batch.create({
    data: {
      farmId: farm.id, code: `KG-${year}-002`, strainId: cheese.id, source: "CLONE",
      stage: "FLOWERING", plantCount: 220, areaId: tunnel2.id, startDate: daysAgo(75),
      events: {
        create: [
          { type: "STAGE_CHANGE", stage: "CLONE", note: "Batch started from clone", at: daysAgo(75), byUserId: owner.id },
          { type: "STAGE_CHANGE", stage: "VEGETATIVE", note: "Stage: CLONE → VEGETATIVE", at: daysAgo(60), byUserId: worker.id },
          { type: "STAGE_CHANGE", stage: "FLOWERING", note: "Stage: VEGETATIVE → FLOWERING", at: daysAgo(21), byUserId: worker.id },
          { type: "HEALTH_CHECK", health: "HEALTHY", note: "Weekly scout: no pests, trichomes developing well", at: daysAgo(3), byUserId: worker.id },
        ],
      },
    },
  });

  // Batch 3 — young vegetative mothers, individually tagged
  const b3 = await prisma.batch.create({
    data: {
      farmId: farm.id, code: `KG-${year}-003`, strainId: durban.id, source: "SEED",
      stage: "VEGETATIVE", plantCount: 24, areaId: momRoom.id, startDate: daysAgo(30),
      plants: {
        create: Array.from({ length: 24 }, (_, i) => ({
          tag: `KG-${year}-003-P${String(i + 1).padStart(3, "0")}`, stage: "VEGETATIVE" as const,
        })),
      },
      events: {
        create: [
          { type: "STAGE_CHANGE", stage: "GERMINATION", note: "Mother stock started from seed", at: daysAgo(30), byUserId: owner.id },
          { type: "STAGE_CHANGE", stage: "VEGETATIVE", note: "Stage: SEEDLING → VEGETATIVE", at: daysAgo(12), byUserId: worker.id },
        ],
      },
    },
  });

  // Input logs across ~4 months
  const inputs: Array<Parameters<typeof prisma.inputLog.create>[0]["data"]> = [];
  for (let week = 0; week < 18; week++) {
    const at = daysAgo(126 - week * 7);
    inputs.push(
      { farmId: farm.id, batchId: week < 17 ? b1.id : b2.id, type: "IRRIGATION", product: "Borehole water", quantity: 1200 + week * 40, unit: "L", costRands: 85, byUserId: worker.id, at },
      { farmId: farm.id, batchId: week < 17 ? b1.id : b2.id, type: "NUTRIENT", product: "Hygrotech Hydrogrow A+B", quantity: 6, unit: "L", costRands: 540, byUserId: worker.id, at },
      { farmId: farm.id, type: "LABOUR", product: "General cultivation labour", laborHours: 32, costRands: 1920, byUserId: owner.id, at }
    );
    if (week % 3 === 0) {
      inputs.push({ farmId: farm.id, batchId: b1.id, type: "PESTICIDE", product: "Neem oil (organic)", quantity: 1.5, unit: "L", costRands: 310, notes: "Preventative IPM spray", byUserId: worker.id, at });
    }
  }
  inputs.push(
    { farmId: farm.id, batchId: b2.id, type: "GROWING_MEDIA", product: "Coco coir 50L bags", quantity: 60, unit: "bags", costRands: 5400, byUserId: owner.id, at: daysAgo(76) },
    { farmId: farm.id, type: "EQUIPMENT", product: "Drip line replacement — Tunnel 2", costRands: 2350, byUserId: owner.id, at: daysAgo(40) },
    { farmId: farm.id, batchId: b3.id, type: "FERTILIZER", product: "Seedling starter mix", quantity: 10, unit: "kg", costRands: 480, byUserId: worker.id, at: daysAgo(28) }
  );
  for (const data of inputs) await prisma.inputLog.create({ data });

  // Environment readings for the last 14 days
  for (let d = 14; d >= 0; d--) {
    await prisma.environmentReading.create({
      data: {
        areaId: d % 2 === 0 ? tunnel1.id : tunnel2.id,
        tempC: 24 + Math.sin(d) * 3,
        humidity: 58 + Math.cos(d) * 8,
        ph: 6.1 + (d % 3) * 0.1,
        ec: 1.7 + (d % 4) * 0.1,
        at: daysAgo(d, 9),
      },
    });
  }
  await prisma.environmentReading.create({
    data: { areaId: dryRoom.id, tempC: 18.5, humidity: 52, at: daysAgo(2, 14) },
  });

  // Daily logs
  const dailyNotes = [
    "Defoliated lower canopy in Tunnel 2. Trichomes ~20% cloudy on KG-002.",
    "Flushed irrigation lines. Scouted for russet mites — none found.",
    "Trimming crew of 4 processing KG-001 harvest in drying room.",
    "Routine day: feeding, pH checks, mother plant maintenance.",
  ];
  for (let i = 0; i < dailyNotes.length; i++) {
    await prisma.dailyLog.create({
      data: { farmId: farm.id, date: daysAgo(i + 1), weather: i % 2 ? "Overcast, 22°C" : "Sunny, 27°C, light wind", notes: dailyNotes[i], byUserId: i % 2 ? worker.id : owner.id },
    });
  }

  // Tasks
  await prisma.taskItem.createMany({
    data: [
      { farmId: farm.id, title: "Weekly IPM scout — Tunnel 2", priority: "HIGH", status: "PENDING", dueDate: daysAhead(1), assigneeId: worker.id, batchId: b2.id },
      { farmId: farm.id, title: "Turn and burp curing bins", priority: "MEDIUM", status: "PENDING", dueDate: daysAhead(0), assigneeId: worker.id },
      { farmId: farm.id, title: "Submit monthly cultivation report to SAHPRA", priority: "URGENT", status: "PENDING", dueDate: daysAgo(2), assigneeId: owner.id },
      { farmId: farm.id, title: "Calibrate EC/pH meters", priority: "LOW", status: "PENDING", dueDate: daysAhead(6) },
      { farmId: farm.id, title: "Take clones from mother stock", priority: "MEDIUM", status: "DONE", completedAt: daysAgo(3), batchId: b3.id, assigneeId: worker.id },
      { farmId: farm.id, title: "Fix shade net tear — Tunnel 1", priority: "MEDIUM", status: "DONE", completedAt: daysAgo(9), assigneeId: worker.id },
    ],
  });

  // Compliance + inspections
  await prisma.complianceRecord.createMany({
    data: [
      { farmId: farm.id, requirement: "Monthly cultivation report to SAHPRA", status: "ACTION_REQUIRED", dueDate: daysAhead(5) },
      { farmId: farm.id, requirement: "Quarterly security audit", status: "COMPLIANT", completedAt: daysAgo(20) },
      { farmId: farm.id, requirement: "Annual licence renewal application", status: "ACTION_REQUIRED", dueDate: daysAhead(140) },
      { farmId: farm.id, requirement: "Staff background checks (new hires)", status: "COMPLIANT", completedAt: daysAgo(45) },
      { farmId: farm.id, requirement: "Pesticide usage register update", status: "OVERDUE", dueDate: daysAgo(4) },
    ],
  });
  await prisma.inspection.createMany({
    data: [
      { farmId: farm.id, type: "SAHPRA", inspectorName: "Dr. Naledi Mokoena", date: daysAgo(35), passed: true, findings: "Records complete. Minor: label two nutrient drums." },
      { farmId: farm.id, type: "Internal", inspectorName: "Thandi Nkosi", date: daysAgo(14), passed: true },
      { farmId: farm.id, type: "Security", inspectorName: "GuardCo Assessors", date: daysAgo(50), passed: false, findings: "Perimeter camera 3 offline", correctiveAction: "Camera replaced and tested" },
    ],
  });

  // Waste / destruction
  await prisma.wasteLog.createMany({
    data: [
      { farmId: farm.id, batchId: b1.id, reason: "MALE_PLANT", plantCount: 4, method: "Shredded and composted on site", witnessName: "Sipho Dlamini", at: daysAgo(85), byUserId: owner.id },
      { farmId: farm.id, batchId: b2.id, reason: "DISEASED", plantCount: 6, weightGrams: 900, method: "Shredded, rendered unusable with soil, composted", witnessName: "Thandi Nkosi", notes: "Botrytis on two colas, removed whole plants as precaution", at: daysAgo(10), byUserId: worker.id },
    ],
  });

  // Harvest of batch 1 + inventory chain
  const harvest = await prisma.harvest.create({
    data: {
      farmId: farm.id, batchId: b1.id, date: daysAgo(7), plantCount: 176,
      wetWeightG: 42500, dryWeightG: 9350, byUserId: owner.id,
      notes: "Strong harvest, dense colas. 4 males culled earlier in cycle.",
    },
  });
  const lot1 = await prisma.inventoryLot.create({
    data: {
      farmId: farm.id, harvestId: harvest.id, code: `LOT-KG-${year}-001-001`,
      product: "FLOWER", weightGrams: 8400, status: "CURING", storageLocation: "Drying Room, rack A",
      processing: {
        create: [
          { type: "drying", startedAt: daysAgo(7), completedAt: daysAgo(2), inputWeightG: 42500, outputWeightG: 9350, byUserId: worker.id },
          { type: "trimming", startedAt: daysAgo(2), completedAt: daysAgo(1), inputWeightG: 9350, outputWeightG: 8400, byUserId: worker.id },
          { type: "curing", startedAt: daysAgo(1), byUserId: worker.id },
        ],
      },
    },
  });
  await prisma.inventoryLot.create({
    data: {
      farmId: farm.id, harvestId: harvest.id, code: `LOT-KG-${year}-001-002`,
      product: "TRIM", weightGrams: 950, status: "IN_STORAGE", storageLocation: "Vault, bin 3",
    },
  });

  // Documents
  await prisma.document.createMany({
    data: [
      { farmId: farm.id, type: "LICENCE", title: "SAHPRA Cultivation Licence 2025/26", expiryDate: daysAhead(200), uploadedById: owner.id },
      { farmId: farm.id, type: "SOP", title: "SOP-01 Integrated Pest Management", uploadedById: owner.id },
      { farmId: farm.id, type: "SOP", title: "SOP-02 Harvest & Post-Harvest Handling", uploadedById: owner.id },
      { farmId: farm.id, type: "CERTIFICATE", title: "GACP Training Certificates — 2026 staff", expiryDate: daysAhead(45), uploadedById: owner.id },
      { farmId: farm.id, type: "INSURANCE", title: "Crop & liability insurance policy", expiryDate: daysAhead(120), uploadedById: owner.id },
    ],
  });

  await prisma.auditLog.create({
    data: { userId: owner.id, farmId: farm.id, action: "CREATE", entity: "Seed", detail: { note: "Demo data seeded" } },
  });

  console.log(`Seeded farm "${farm.name}" (${farm.id})`);
  console.log(`  Batches: ${b1.code} (harvested), ${b2.code} (flowering), ${b3.code} (veg, tagged)`);
  console.log(`  Lot: ${lot1.code} curing`);
  console.log("  Login: demo@khulagrow.co.za / demo1234 (owner)");
  console.log("         worker@khulagrow.co.za / demo1234 (worker)");
  console.log("         inspector@khulagrow.co.za / demo1234 (inspector, read-only)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
