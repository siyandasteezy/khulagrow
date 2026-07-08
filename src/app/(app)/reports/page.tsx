"use client";

import { useState } from "react";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Spinner, EmptyState, Button } from "@/components/ui";
import { apiGet } from "@/lib/offline";
import { exportTablePDF, exportExcel, exportPortfolioPDF } from "@/lib/reports";
import { INPUT_TYPE_LABELS, STAGE_LABELS, WASTE_REASON_LABELS, LOT_STATUS_LABELS, PRODUCT_LABELS, fmtGrams, fmtRands } from "@/lib/constants";
import { format } from "date-fns";

const fmtDate = (d: string | null | undefined) => (d ? format(new Date(d), "yyyy-MM-dd") : "");
const fmtDateTime = (d: string | null | undefined) => (d ? format(new Date(d), "yyyy-MM-dd HH:mm") : "");

/* Loosely-typed API rows — reports render whatever fields exist. */
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ReportsPage() {
  const { farm, loading } = useFarm();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (loading) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
    } catch {
      setMsg("Could not generate the report — check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  // ── Data fetchers ────────────────────────────────────────────

  const getInputs = () => apiGet<any[]>(`/api/inputs?farmId=${farm!.id}`);
  const getBatches = () => apiGet<any[]>(`/api/batches?farmId=${farm!.id}`);
  const getHarvests = () => apiGet<any[]>(`/api/harvests?farmId=${farm!.id}`);
  const getWaste = () => apiGet<any[]>(`/api/waste?farmId=${farm!.id}`);
  const getInventory = () => apiGet<any[]>(`/api/inventory?farmId=${farm!.id}`);
  const getCompliance = () => apiGet<any[]>(`/api/compliance?farmId=${farm!.id}`);
  const getInspections = () => apiGet<any[]>(`/api/inspections?farmId=${farm!.id}`);
  const getDailyLogs = () => apiGet<any[]>(`/api/daily-logs?farmId=${farm!.id}`);

  // ── Report definitions ───────────────────────────────────────

  const cultivationPDF = () =>
    run("cult-pdf", async () => {
      const [inputs, dailies] = await Promise.all([getInputs(), getDailyLogs()]);
      exportTablePDF({
        filename: `cultivation-log-${fmtDate(new Date().toISOString())}`,
        title: "Cultivation Log",
        farmName: farm!.name,
        summary: [`${inputs.length} input entries · ${dailies.length} daily logs`],
        columns: ["Date", "Type", "Batch", "Product", "Qty", "Unit", "Cost (R)", "Notes"],
        rows: inputs.map((i) => [
          fmtDateTime(i.at), INPUT_TYPE_LABELS[i.type] ?? i.type, i.batch?.code ?? "Farm-wide",
          i.product ?? "", i.quantity ?? i.laborHours ?? "", i.unit ?? "",
          i.costRands ?? "", i.notes ?? "",
        ]),
      });
    });

  const cultivationExcel = () =>
    run("cult-xlsx", async () => {
      const [inputs, dailies, batches] = await Promise.all([getInputs(), getDailyLogs(), getBatches()]);
      exportExcel({
        filename: `cultivation-log-${fmtDate(new Date().toISOString())}`,
        sheets: [
          {
            name: "Input logs",
            rows: inputs.map((i) => ({
              Date: fmtDateTime(i.at), Type: INPUT_TYPE_LABELS[i.type] ?? i.type,
              Batch: i.batch?.code ?? "Farm-wide", Product: i.product ?? "",
              Quantity: i.quantity ?? "", Unit: i.unit ?? "", "Labour hours": i.laborHours ?? "",
              "Cost (R)": i.costRands ?? "", Notes: i.notes ?? "",
            })),
          },
          {
            name: "Daily logs",
            rows: dailies.map((d) => ({ Date: fmtDate(d.date), Weather: d.weather ?? "", Notes: d.notes })),
          },
          {
            name: "Batches",
            rows: batches.map((b) => ({
              Code: b.code, Strain: b.strain.name, Source: b.source,
              Stage: STAGE_LABELS[b.stage] ?? b.stage, Plants: b.plantCount,
              Area: b.area?.name ?? "", Started: fmtDate(b.startDate),
            })),
          },
        ],
      });
    });

  const compliancePDF = () =>
    run("comp-pdf", async () => {
      const [records, inspections, waste] = await Promise.all([getCompliance(), getInspections(), getWaste()]);
      const doc = {
        filename: `compliance-report-${fmtDate(new Date().toISOString())}`,
        title: "SAHPRA Compliance Report",
        farmName: farm!.name,
        extra: farm!.licenceNumber ? `Licence: ${farm!.licenceNumber}` : undefined,
        summary: [
          `Compliance items: ${records.length} (${records.filter((r: any) => r.status === "COMPLIANT").length} compliant)`,
          `Inspections: ${inspections.length} (${inspections.filter((i: any) => i.passed).length} passed)`,
          `Destruction events: ${waste.length}`,
        ],
        columns: ["Category", "Item", "Status / Result", "Date", "Detail"],
        rows: [
          ...records.map((r: any) => [
            "Requirement", r.requirement, r.status.replace("_", " "),
            fmtDate(r.dueDate), r.notes ?? "",
          ]),
          ...inspections.map((i: any) => [
            "Inspection", `${i.type} — ${i.inspectorName}`, i.passed ? "Passed" : "Failed",
            fmtDate(i.date), i.findings ?? "",
          ]),
          ...waste.map((w: any) => [
            "Destruction", w.batch?.code ?? "-", WASTE_REASON_LABELS[w.reason] ?? w.reason,
            fmtDate(w.at), `${w.plantCount ?? ""} plants ${w.weightGrams ? fmtGrams(w.weightGrams) : ""} · ${w.method} · witness: ${w.witnessName}`,
          ]),
        ] as (string | number)[][],
      };
      exportTablePDF(doc);
    });

  const harvestPDF = () =>
    run("harv-pdf", async () => {
      const harvests = await getHarvests();
      const totWet = harvests.reduce((s: number, h: any) => s + h.wetWeightG, 0);
      const totDry = harvests.reduce((s: number, h: any) => s + (h.dryWeightG ?? 0), 0);
      exportTablePDF({
        filename: `harvest-report-${fmtDate(new Date().toISOString())}`,
        title: "Harvest Report",
        farmName: farm!.name,
        summary: [`Total: ${fmtGrams(totWet)} wet · ${fmtGrams(totDry)} dry across ${harvests.length} harvests`],
        columns: ["Date", "Batch", "Strain", "Plants", "Wet (g)", "Dry (g)", "Lots"],
        rows: harvests.map((h: any) => [
          fmtDate(h.date), h.batch.code, h.batch.strain.name, h.plantCount,
          h.wetWeightG, h.dryWeightG ?? "", h.lots.map((l: any) => l.code).join(", "),
        ]),
      });
    });

  const inventoryExcel = () =>
    run("inv-xlsx", async () => {
      const lots = await getInventory();
      exportExcel({
        filename: `inventory-${fmtDate(new Date().toISOString())}`,
        sheets: [
          {
            name: "Lots",
            rows: lots.map((l: any) => ({
              "Lot code": l.code, Product: PRODUCT_LABELS[l.product] ?? l.product,
              "Weight (g)": l.weightGrams, Status: LOT_STATUS_LABELS[l.status] ?? l.status,
              Location: l.storageLocation ?? "", "Packaged units": l.packagedUnits ?? "",
              "Source batch": l.harvest?.batch?.code ?? "",
              Strain: l.harvest?.batch?.strain?.name ?? "", Created: fmtDate(l.createdAt),
            })),
          },
          {
            name: "Processing",
            rows: lots.flatMap((l: any) =>
              l.processing.map((p: any) => ({
                "Lot code": l.code, Step: p.type, Started: fmtDateTime(p.startedAt),
                Completed: fmtDateTime(p.completedAt), "In (g)": p.inputWeightG ?? "",
                "Out (g)": p.outputWeightG ?? "",
              }))
            ),
          },
        ],
      });
    });

  const financialExcel = () =>
    run("fin-xlsx", async () => {
      const inputs = await getInputs();
      const byType = new Map<string, number>();
      const byMonth = new Map<string, number>();
      for (const i of inputs) {
        const c = i.costRands ?? 0;
        byType.set(i.type, (byType.get(i.type) ?? 0) + c);
        const m = fmtDate(i.at).slice(0, 7);
        byMonth.set(m, (byMonth.get(m) ?? 0) + c);
      }
      exportExcel({
        filename: `financial-summary-${fmtDate(new Date().toISOString())}`,
        sheets: [
          {
            name: "By category",
            rows: [...byType.entries()].map(([t, c]) => ({
              Category: INPUT_TYPE_LABELS[t] ?? t, "Total cost (R)": Number(c.toFixed(2)),
            })),
          },
          {
            name: "By month",
            rows: [...byMonth.entries()].sort().map(([m, c]) => ({
              Month: m, "Total cost (R)": Number(c.toFixed(2)),
            })),
          },
          {
            name: "All entries",
            rows: inputs.map((i: any) => ({
              Date: fmtDateTime(i.at), Category: INPUT_TYPE_LABELS[i.type] ?? i.type,
              Batch: i.batch?.code ?? "Farm-wide", Product: i.product ?? "", "Cost (R)": i.costRands ?? 0,
            })),
          },
        ],
      });
    });

  const portfolioPDF = () =>
    run("port-pdf", async () => {
      const [batches, harvests, inputs, lots] = await Promise.all([
        getBatches(), getHarvests(), getInputs(), getInventory(),
      ]);
      const totWet = harvests.reduce((s: number, h: any) => s + h.wetWeightG, 0);
      const totDry = harvests.reduce((s: number, h: any) => s + (h.dryWeightG ?? 0), 0);
      const totCost = inputs.reduce((s: number, i: any) => s + (i.costRands ?? 0), 0);
      const active = batches.filter((b: any) => !["HARVESTED", "DESTROYED"].includes(b.stage));

      exportPortfolioPDF({
        farmName: farm!.name,
        licence: farm!.licenceNumber,
        stats: [
          { label: "Active plants", value: String(active.reduce((s: number, b: any) => s + b.plantCount, 0)) },
          { label: "Active batches", value: String(active.length) },
          { label: "Total dry yield", value: fmtGrams(totDry) },
          { label: "Total wet yield", value: fmtGrams(totWet) },
          { label: "Total input costs", value: fmtRands(totCost) },
          { label: "Inventory lots", value: String(lots.length) },
        ],
        sections: [
          {
            heading: "Batches",
            columns: ["Code", "Strain", "Stage", "Plants", "Started"],
            rows: batches.map((b: any) => [
              b.code, b.strain.name, STAGE_LABELS[b.stage] ?? b.stage, b.plantCount, fmtDate(b.startDate),
            ]),
          },
          {
            heading: "Harvest history",
            columns: ["Date", "Batch", "Plants", "Wet (g)", "Dry (g)"],
            rows: harvests.map((h: any) => [
              fmtDate(h.date), h.batch.code, h.plantCount, h.wetWeightG, h.dryWeightG ?? "",
            ]),
          },
          {
            heading: "Current inventory",
            columns: ["Lot", "Product", "Weight (g)", "Status"],
            rows: lots
              .filter((l: any) => !["SHIPPED", "DESTROYED"].includes(l.status))
              .map((l: any) => [l.code, PRODUCT_LABELS[l.product] ?? l.product, l.weightGrams, LOT_STATUS_LABELS[l.status] ?? l.status]),
          },
        ],
      });
    });

  const REPORTS = [
    { key: "cult-pdf", icon: "🌿", label: "Cultivation log", desc: "All input logs and activity", action: cultivationPDF, kind: "PDF" },
    { key: "cult-xlsx", icon: "🌿", label: "Cultivation workbook", desc: "Inputs, daily logs and batches", action: cultivationExcel, kind: "Excel" },
    { key: "comp-pdf", icon: "🛡️", label: "SAHPRA compliance report", desc: "Requirements, inspections, destruction log", action: compliancePDF, kind: "PDF" },
    { key: "harv-pdf", icon: "✂️", label: "Harvest report", desc: "Yields per batch with lot traceability", action: harvestPDF, kind: "PDF" },
    { key: "inv-xlsx", icon: "📦", label: "Inventory report", desc: "Lots, weights, processing history", action: inventoryExcel, kind: "Excel" },
    { key: "fin-xlsx", icon: "💰", label: "Financial summary", desc: "Costs by category and month", action: financialExcel, kind: "Excel" },
    { key: "port-pdf", icon: "📈", label: "Cultivation portfolio", desc: "Investor-ready farm overview", action: portfolioPDF, kind: "PDF" },
  ];

  return (
    <div>
      <PageHeader title="Reports & exports" subtitle="Generated on-device from live data" />
      {msg && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>}
      <div className="space-y-2.5">
        {REPORTS.map((r) => (
          <Card key={r.key} className="flex items-center gap-3.5 p-3.5">
            <span className="text-2xl">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{r.label}</p>
              <p className="text-xs text-gray-400">{r.desc}</p>
            </div>
            <Button size="sm" variant="secondary" disabled={busy !== null} onClick={r.action}>
              {busy === r.key ? "…" : `⬇ ${r.kind}`}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
