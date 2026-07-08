"use client";

import { useCallback, useEffect, useState } from "react";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Spinner, EmptyState, Badge, Sheet, Field, Input, Select, Button, Textarea, cn } from "@/components/ui";
import { apiGet, apiMutate } from "@/lib/offline";
import { WASTE_REASON_LABELS, fmtGrams } from "@/lib/constants";
import { format } from "date-fns";

type ComplianceRow = { id: string; requirement: string; status: string; dueDate: string | null; completedAt: string | null; notes: string | null };
type InspectionRow = { id: string; type: string; inspectorName: string; date: string; passed: boolean; findings: string | null; correctiveAction: string | null };
type WasteRow = { id: string; reason: string; weightGrams: number | null; plantCount: number | null; method: string; witnessName: string; at: string; batch: { code: string } | null };

const TABS = ["requirements", "inspections", "destruction"] as const;
const STATUS_STYLE: Record<string, string> = {
  COMPLIANT: "bg-green-100 text-green-800",
  ACTION_REQUIRED: "bg-amber-100 text-amber-800",
  OVERDUE: "bg-red-100 text-red-800",
};

export default function CompliancePage() {
  const { farm, loading } = useFarm();
  const [tab, setTab] = useState<(typeof TABS)[number]>("requirements");
  const [records, setRecords] = useState<ComplianceRow[] | null>(null);
  const [inspections, setInspections] = useState<InspectionRow[] | null>(null);
  const [waste, setWaste] = useState<WasteRow[] | null>(null);
  const [sheet, setSheet] = useState<"requirement" | "inspection" | null>(null);
  const [reqForm, setReqForm] = useState({ requirement: "", dueDate: "", notes: "" });
  const [inspForm, setInspForm] = useState({ type: "Internal", inspectorName: "", passed: true, findings: "", correctiveAction: "" });
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!farm) return;
    apiGet<ComplianceRow[]>(`/api/compliance?farmId=${farm.id}`).then(setRecords).catch(() => setRecords([]));
    apiGet<InspectionRow[]>(`/api/inspections?farmId=${farm.id}`).then(setInspections).catch(() => setInspections([]));
    apiGet<WasteRow[]>(`/api/waste?farmId=${farm.id}`).then(setWaste).catch(() => setWaste([]));
  }, [farm]);
  useEffect(load, [load]);

  if (loading || (farm && (!records || !inspections || !waste))) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  async function markCompliant(id: string) {
    const r = await apiMutate(`/api/compliance/${id}`, "PUT", { status: "COMPLIANT" });
    if (r.queued) setMsg("Saved offline — will sync when online");
    load();
  }

  async function addRequirement(e: React.FormEvent) {
    e.preventDefault();
    const r = await apiMutate("/api/compliance", "POST", {
      farmId: farm!.id,
      requirement: reqForm.requirement,
      dueDate: reqForm.dueDate ? new Date(reqForm.dueDate).toISOString() : undefined,
      notes: reqForm.notes || undefined,
    });
    if (r.error) { setMsg(r.error); return; }
    setSheet(null);
    setReqForm({ requirement: "", dueDate: "", notes: "" });
    load();
  }

  async function addInspection(e: React.FormEvent) {
    e.preventDefault();
    const r = await apiMutate("/api/inspections", "POST", {
      farmId: farm!.id,
      type: inspForm.type,
      inspectorName: inspForm.inspectorName,
      passed: inspForm.passed,
      findings: inspForm.findings || undefined,
      correctiveAction: inspForm.correctiveAction || undefined,
    });
    if (r.error) { setMsg(r.error); return; }
    setSheet(null);
    setInspForm({ type: "Internal", inspectorName: "", passed: true, findings: "", correctiveAction: "" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Compliance"
        subtitle="SAHPRA record-keeping"
        action={
          tab !== "destruction" ? (
            <Button size="sm" onClick={() => setSheet(tab === "requirements" ? "requirement" : "inspection")}>
              + Add
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-3 rounded-xl bg-gray-100 p-1 text-sm font-semibold">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("rounded-lg py-1.5 capitalize", tab === t ? "bg-white text-brand-800 shadow-sm" : "text-gray-500")}>
            {t}
          </button>
        ))}
      </div>

      {msg && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" onClick={() => setMsg(null)}>{msg}</p>}

      {tab === "requirements" && (
        records!.length === 0 ? (
          <EmptyState icon="🛡️" title="No compliance requirements" hint="Track SAHPRA reports, licence renewals, security audits" />
        ) : (
          <div className="space-y-2.5">
            {records!.map((r) => (
              <Card key={r.id} className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-900">{r.requirement}</p>
                  <Badge className={STATUS_STYLE[r.status]}>{r.status.replace("_", " ").toLowerCase()}</Badge>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {r.dueDate ? `Due ${format(new Date(r.dueDate), "d MMM yyyy")}` : ""}
                    {r.completedAt ? ` · done ${format(new Date(r.completedAt), "d MMM yyyy")}` : ""}
                  </p>
                  {r.status !== "COMPLIANT" && (
                    <button onClick={() => markCompliant(r.id)} className="text-sm font-semibold text-brand-700">
                      Mark compliant ✓
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === "inspections" && (
        inspections!.length === 0 ? (
          <EmptyState icon="🔎" title="No inspections recorded" />
        ) : (
          <div className="space-y-2.5">
            {inspections!.map((i) => (
              <Card key={i.id} className="p-3.5">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-900">{i.type} inspection</p>
                  <Badge className={i.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {i.passed ? "Passed" : "Failed"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {i.inspectorName} · {format(new Date(i.date), "d MMM yyyy")}
                </p>
                {i.findings && <p className="mt-1.5 text-sm text-gray-600">Findings: {i.findings}</p>}
                {i.correctiveAction && <p className="mt-0.5 text-sm text-gray-600">Action: {i.correctiveAction}</p>}
              </Card>
            ))}
          </div>
        )
      )}

      {tab === "destruction" && (
        waste!.length === 0 ? (
          <EmptyState icon="🗑️" title="No destruction events" hint="Record destruction from a batch page" />
        ) : (
          <div className="space-y-2.5">
            {waste!.map((w) => (
              <Card key={w.id} className="p-3.5">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-900">
                    {w.batch?.code ?? "—"} · {WASTE_REASON_LABELS[w.reason]}
                  </p>
                  <span className="text-xs text-gray-400">{format(new Date(w.at), "d MMM yyyy")}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {w.plantCount ? `${w.plantCount} plants` : ""}
                  {w.plantCount && w.weightGrams ? " · " : ""}
                  {w.weightGrams ? fmtGrams(w.weightGrams) : ""}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Method: {w.method} · Witness: {w.witnessName}
                </p>
              </Card>
            ))}
          </div>
        )
      )}

      <Sheet open={sheet === "requirement"} onClose={() => setSheet(null)} title="Add compliance requirement">
        <form onSubmit={addRequirement} className="space-y-4">
          <Field label="Requirement">
            <Input required value={reqForm.requirement} onChange={(e) => setReqForm({ ...reqForm, requirement: e.target.value })}
              placeholder="Submit monthly cultivation report to SAHPRA" />
          </Field>
          <Field label="Due date">
            <Input type="date" value={reqForm.dueDate} onChange={(e) => setReqForm({ ...reqForm, dueDate: e.target.value })} />
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={reqForm.notes} onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })} />
          </Field>
          <Button type="submit" size="lg">Add requirement</Button>
        </form>
      </Sheet>

      <Sheet open={sheet === "inspection"} onClose={() => setSheet(null)} title="Record inspection">
        <form onSubmit={addInspection} className="space-y-4">
          <Field label="Inspection type">
            <Select value={inspForm.type} onChange={(e) => setInspForm({ ...inspForm, type: e.target.value })}>
              <option>Internal</option>
              <option>SAHPRA</option>
              <option>Security</option>
              <option>Quality</option>
              <option>Pest control</option>
            </Select>
          </Field>
          <Field label="Inspector name">
            <Input required value={inspForm.inspectorName} onChange={(e) => setInspForm({ ...inspForm, inspectorName: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map((v) => (
              <button key={String(v)} type="button" onClick={() => setInspForm({ ...inspForm, passed: v })}
                className={cn("h-12 rounded-xl border-2 font-bold",
                  inspForm.passed === v
                    ? v ? "border-green-600 bg-green-50 text-green-800" : "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-500")}>
                {v ? "Passed" : "Failed"}
              </button>
            ))}
          </div>
          <Field label="Findings (optional)">
            <Textarea value={inspForm.findings} onChange={(e) => setInspForm({ ...inspForm, findings: e.target.value })} />
          </Field>
          <Field label="Corrective action (optional)">
            <Textarea value={inspForm.correctiveAction} onChange={(e) => setInspForm({ ...inspForm, correctiveAction: e.target.value })} />
          </Field>
          <Button type="submit" size="lg">Record inspection</Button>
        </form>
      </Sheet>
    </div>
  );
}
