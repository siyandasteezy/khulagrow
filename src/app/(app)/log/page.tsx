"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFarm } from "@/components/FarmContext";
import { Button, Card, Field, Input, PageHeader, Select, Spinner, Textarea, cn, EmptyState } from "@/components/ui";
import { apiGet, apiMutate } from "@/lib/offline";
import { INPUT_TYPE_LABELS, INPUT_TYPE_ICONS } from "@/lib/constants";

type BatchOpt = { id: string; code: string; stage: string };
type AreaOpt = { id: string; name: string };

const UNITS: Record<string, string> = {
  IRRIGATION: "L", NUTRIENT: "L", FERTILIZER: "kg", PESTICIDE: "L",
  FUNGICIDE: "L", GROWING_MEDIA: "kg", LABOUR: "hours", EQUIPMENT: "", OTHER: "",
};

function LogInner() {
  const { farm, loading } = useFarm();
  const searchParams = useSearchParams();
  const preselectedBatch = searchParams.get("batchId") ?? "";

  const [mode, setMode] = useState<"input" | "daily" | "env">("input");
  const [type, setType] = useState<string | null>(null);
  const [batches, setBatches] = useState<BatchOpt[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ batchId: preselectedBatch, product: "", quantity: "", unit: "", costRands: "", laborHours: "", notes: "" });
  const [daily, setDaily] = useState({ weather: "", notes: "" });
  const [env, setEnv] = useState({ areaId: "", tempC: "", humidity: "", ph: "", ec: "" });

  useEffect(() => {
    if (!farm) return;
    apiGet<BatchOpt[]>(`/api/batches?farmId=${farm.id}`)
      .then((b) => setBatches(b.filter((x) => !["HARVESTED", "DESTROYED"].includes(x.stage))))
      .catch(() => {});
    apiGet<{ areas: AreaOpt[] }>(`/api/farms/${farm.id}`)
      .then((f) => { setAreas(f.areas); setEnv((e) => ({ ...e, areaId: e.areaId || f.areas[0]?.id || "" })); })
      .catch(() => {});
  }, [farm]);

  if (loading) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  function flash(r: { queued: boolean; error?: string }, ok: string) {
    setMsg(r.error ?? (r.queued ? "Saved offline — will sync when online ✓" : ok));
  }

  async function submitInput(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;
    setBusy(true);
    const r = await apiMutate("/api/inputs", "POST", {
      farmId: farm!.id,
      batchId: form.batchId || undefined,
      type,
      product: form.product || undefined,
      quantity: form.quantity ? Number(form.quantity) : undefined,
      unit: form.unit || UNITS[type] || undefined,
      costRands: form.costRands ? Number(form.costRands) : undefined,
      laborHours: form.laborHours ? Number(form.laborHours) : undefined,
      notes: form.notes || undefined,
    });
    setBusy(false);
    flash(r, `${INPUT_TYPE_LABELS[type]} logged ✓`);
    if (!r.error) {
      setType(null);
      setForm({ batchId: form.batchId, product: "", quantity: "", unit: "", costRands: "", laborHours: "", notes: "" });
    }
  }

  async function submitDaily(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await apiMutate("/api/daily-logs", "POST", {
      farmId: farm!.id, weather: daily.weather || undefined, notes: daily.notes,
    });
    setBusy(false);
    flash(r, "Daily log saved ✓");
    if (!r.error) setDaily({ weather: "", notes: "" });
  }

  async function submitEnv(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await apiMutate("/api/env-readings", "POST", {
      areaId: env.areaId,
      tempC: env.tempC ? Number(env.tempC) : undefined,
      humidity: env.humidity ? Number(env.humidity) : undefined,
      ph: env.ph ? Number(env.ph) : undefined,
      ec: env.ec ? Number(env.ec) : undefined,
    });
    setBusy(false);
    flash(r, "Reading saved ✓");
    if (!r.error) setEnv({ ...env, tempC: "", humidity: "", ph: "", ec: "" });
  }

  return (
    <div>
      <PageHeader title="Quick log" subtitle={farm.name} />

      <div className="mb-4 grid grid-cols-3 rounded-xl bg-gray-100 p-1 text-sm font-semibold">
        {([["input", "Inputs"], ["daily", "Daily log"], ["env", "Environment"]] as const).map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setMsg(null); }}
            className={cn("rounded-lg py-1.5", mode === m ? "bg-white text-brand-800 shadow-sm" : "text-gray-500")}>
            {l}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800" onClick={() => setMsg(null)}>
          {msg}
        </p>
      )}

      {mode === "input" && !type && (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(INPUT_TYPE_LABELS).map(([v, l]) => (
            <button key={v} onClick={() => { setType(v); setForm((f) => ({ ...f, unit: UNITS[v] })); }}
              className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-white text-xs font-semibold text-gray-700 shadow-sm active:scale-95 transition-transform">
              <span className="text-3xl">{INPUT_TYPE_ICONS[v]}</span>
              {l}
            </button>
          ))}
        </div>
      )}

      {mode === "input" && type && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-gray-900">{INPUT_TYPE_ICONS[type]} {INPUT_TYPE_LABELS[type]}</p>
            <button onClick={() => setType(null)} className="text-sm font-medium text-brand-700">Change</button>
          </div>
          <form onSubmit={submitInput} className="space-y-4">
            <Field label="Batch (optional — leave blank for whole farm)">
              <Select value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}>
                <option value="">Whole farm</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.code}</option>)}
              </Select>
            </Field>
            {type !== "LABOUR" && (
              <Field label="Product / description">
                <Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
                  placeholder={type === "IRRIGATION" ? "Borehole water" : "Product name"} />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              {type === "LABOUR" ? (
                <Field label="Hours worked">
                  <Input type="number" step="0.5" inputMode="decimal" value={form.laborHours} onChange={(e) => setForm({ ...form, laborHours: e.target.value })} />
                </Field>
              ) : (
                <Field label={`Quantity${form.unit ? ` (${form.unit})` : ""}`}>
                  <Input type="number" step="0.01" inputMode="decimal" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </Field>
              )}
              <Field label="Cost (R)">
                <Input type="number" step="0.01" inputMode="decimal" value={form.costRands} onChange={(e) => setForm({ ...form, costRands: e.target.value })} />
              </Field>
            </div>
            <Field label="Notes (optional)">
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
            <Button type="submit" size="lg" disabled={busy}>{busy ? "Saving…" : "Save log"}</Button>
          </form>
        </Card>
      )}

      {mode === "daily" && (
        <Card>
          <form onSubmit={submitDaily} className="space-y-4">
            <Field label="Weather">
              <Input value={daily.weather} onChange={(e) => setDaily({ ...daily, weather: e.target.value })} placeholder="Sunny, 28°C, light wind" />
            </Field>
            <Field label="Today's cultivation notes">
              <Textarea required value={daily.notes} onChange={(e) => setDaily({ ...daily, notes: e.target.value })}
                placeholder="Work done, observations, issues…" className="h-36" />
            </Field>
            <Button type="submit" size="lg" disabled={busy}>Save daily log</Button>
          </form>
        </Card>
      )}

      {mode === "env" && (
        <Card>
          {areas.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Add a growing area to your farm first.</p>
          ) : (
            <form onSubmit={submitEnv} className="space-y-4">
              <Field label="Area">
                <Select required value={env.areaId} onChange={(e) => setEnv({ ...env, areaId: e.target.value })}>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Temp (°C)"><Input type="number" step="0.1" inputMode="decimal" value={env.tempC} onChange={(e) => setEnv({ ...env, tempC: e.target.value })} /></Field>
                <Field label="Humidity (%)"><Input type="number" step="1" inputMode="decimal" value={env.humidity} onChange={(e) => setEnv({ ...env, humidity: e.target.value })} /></Field>
                <Field label="pH"><Input type="number" step="0.1" inputMode="decimal" value={env.ph} onChange={(e) => setEnv({ ...env, ph: e.target.value })} /></Field>
                <Field label="EC (mS/cm)"><Input type="number" step="0.01" inputMode="decimal" value={env.ec} onChange={(e) => setEnv({ ...env, ec: e.target.value })} /></Field>
              </div>
              <Button type="submit" size="lg" disabled={busy}>Save reading</Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LogInner />
    </Suspense>
  );
}
