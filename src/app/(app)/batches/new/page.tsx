"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFarm } from "@/components/FarmContext";
import { Button, Card, Field, Input, PageHeader, Select, Sheet, Textarea } from "@/components/ui";
import { apiGet } from "@/lib/offline";

type Strain = { id: string; name: string; type: string };
type Area = { id: string; name: string };

export default function NewBatchPage() {
  const router = useRouter();
  const { farm } = useFarm();
  const [strains, setStrains] = useState<Strain[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [form, setForm] = useState({
    strainId: "", source: "SEED", plantCount: "", areaId: "", notes: "", tagIndividually: false,
  });
  const [strainSheet, setStrainSheet] = useState(false);
  const [newStrain, setNewStrain] = useState({ name: "", type: "HYBRID", genetics: "", floweringDays: "", thcPercent: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiGet<Strain[]>("/api/strains").then((s) => {
      setStrains(s);
      setForm((f) => ({ ...f, strainId: f.strainId || s[0]?.id || "" }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!farm) return;
    apiGet<{ areas: Area[] }>(`/api/farms/${farm.id}`).then((f) => setAreas(f.areas)).catch(() => {});
  }, [farm]);

  async function addStrain(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/strains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newStrain.name,
        type: newStrain.type,
        genetics: newStrain.genetics || undefined,
        floweringDays: newStrain.floweringDays ? Number(newStrain.floweringDays) : undefined,
        thcPercent: newStrain.thcPercent ? Number(newStrain.thcPercent) : undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStrains((s) => [...s.filter((x) => x.id !== data.id), data]);
      setForm((f) => ({ ...f, strainId: data.id }));
      setStrainSheet(false);
    } else {
      setError(data.error);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!farm) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmId: farm.id,
        strainId: form.strainId,
        source: form.source,
        plantCount: Number(form.plantCount),
        areaId: form.areaId || undefined,
        notes: form.notes || undefined,
        tagIndividually: form.tagIndividually,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Failed to create batch"); return; }
    router.push(`/batches/${data.id}`);
  }

  return (
    <div>
      <PageHeader title="New batch" subtitle="A batch gets a unique traceability code" />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Strain">
            <div className="flex gap-2">
              <Select required value={form.strainId} onChange={(e) => setForm({ ...form, strainId: e.target.value })} className="flex-1">
                <option value="" disabled>Select strain…</option>
                {strains.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Button type="button" variant="secondary" onClick={() => setStrainSheet(true)}>＋</Button>
            </div>
          </Field>

          <Field label="Source">
            <div className="grid grid-cols-2 gap-2">
              {(["SEED", "CLONE"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, source: s })}
                  className={`h-14 rounded-xl border-2 text-sm font-bold ${form.source === s ? "border-brand-600 bg-brand-50 text-brand-800" : "border-gray-200 text-gray-500"}`}>
                  {s === "SEED" ? "🌰 Seed" : "🌱 Clone"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Number of plants">
            <Input required type="number" min="1" inputMode="numeric" value={form.plantCount}
              onChange={(e) => setForm({ ...form, plantCount: e.target.value })} placeholder="100" />
          </Field>

          <Field label="Growing area (optional)">
            <Select value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })}>
              <option value="">Not assigned yet</option>
              {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-3.5">
            <input type="checkbox" checked={form.tagIndividually}
              onChange={(e) => setForm({ ...form, tagIndividually: e.target.checked })}
              className="h-5 w-5 accent-brand-700" />
            <span className="text-sm">
              <span className="font-medium text-gray-800">Tag plants individually</span>
              <span className="block text-xs text-gray-400">Creates a unique tag per plant (max 500)</span>
            </span>
          </label>

          <Field label="Notes (optional)">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" size="lg" disabled={busy || !form.strainId}>
            {busy ? "Creating…" : "Start batch"}
          </Button>
        </form>
      </Card>

      <Sheet open={strainSheet} onClose={() => setStrainSheet(false)} title="Add strain">
        <form onSubmit={addStrain} className="space-y-4">
          <Field label="Strain name">
            <Input required value={newStrain.name} onChange={(e) => setNewStrain({ ...newStrain, name: e.target.value })} placeholder="Durban Poison" />
          </Field>
          <Field label="Type">
            <Select value={newStrain.type} onChange={(e) => setNewStrain({ ...newStrain, type: e.target.value })}>
              <option value="SATIVA">Sativa</option>
              <option value="INDICA">Indica</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
          </Field>
          <Field label="Genetics (optional)">
            <Input value={newStrain.genetics} onChange={(e) => setNewStrain({ ...newStrain, genetics: e.target.value })} placeholder="Landrace sativa" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Flowering days"><Input type="number" inputMode="numeric" value={newStrain.floweringDays} onChange={(e) => setNewStrain({ ...newStrain, floweringDays: e.target.value })} /></Field>
            <Field label="THC %"><Input type="number" step="0.1" inputMode="decimal" value={newStrain.thcPercent} onChange={(e) => setNewStrain({ ...newStrain, thcPercent: e.target.value })} /></Field>
          </div>
          <Button type="submit" size="lg">Add strain</Button>
        </form>
      </Sheet>
    </div>
  );
}
