"use client";

import { useCallback, useEffect, useState } from "react";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Spinner, EmptyState, Badge, Sheet, Field, Input, Select, Button, Textarea } from "@/components/ui";
import { apiGet, apiMutate } from "@/lib/offline";
import { fmtGrams, LOT_STATUS_LABELS, PRODUCT_LABELS } from "@/lib/constants";
import { format } from "date-fns";

type Lot = {
  id: string; code: string; product: string; weightGrams: number; status: string;
  storageLocation: string | null; packagedUnits: number | null; createdAt: string;
  harvest: { date: string; batch: { code: string; strain: { name: string } } } | null;
  processing: { id: string; type: string; startedAt: string; completedAt: string | null; inputWeightG: number | null; outputWeightG: number | null }[];
};

const STATUS_COLORS: Record<string, string> = {
  DRYING: "bg-amber-100 text-amber-800", CURING: "bg-orange-100 text-orange-800",
  IN_STORAGE: "bg-green-100 text-green-800", PROCESSING: "bg-blue-100 text-blue-800",
  PACKAGED: "bg-purple-100 text-purple-800", SHIPPED: "bg-gray-200 text-gray-700",
  DESTROYED: "bg-red-100 text-red-800",
};

export default function InventoryPage() {
  const { farm, loading } = useFarm();
  const [lots, setLots] = useState<Lot[] | null>(null);
  const [selected, setSelected] = useState<Lot | null>(null);
  const [proc, setProc] = useState({ type: "drying", outputWeightG: "", storageLocation: "", notes: "" });
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!farm) return;
    apiGet<Lot[]>(`/api/inventory?farmId=${farm.id}`).then(setLots).catch(() => setLots([]));
  }, [farm]);
  useEffect(load, [load]);

  if (loading || (farm && !lots)) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  const activeLots = lots!.filter((l) => !["SHIPPED", "DESTROYED"].includes(l.status));
  const totalWeight = activeLots.reduce((s, l) => s + l.weightGrams, 0);

  async function recordProcessing(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const r = await apiMutate("/api/processing", "POST", {
      lotId: selected.id,
      type: proc.type,
      inputWeightG: selected.weightGrams,
      outputWeightG: proc.outputWeightG ? Number(proc.outputWeightG) : undefined,
      completedAt: proc.outputWeightG ? new Date().toISOString() : undefined,
      notes: proc.notes || undefined,
    });
    if (r.error) { setMsg(r.error); return; }
    if (proc.storageLocation) {
      await apiMutate(`/api/inventory/${selected.id}`, "PUT", { storageLocation: proc.storageLocation });
    }
    setSelected(null);
    setProc({ type: "drying", outputWeightG: "", storageLocation: "", notes: "" });
    setMsg(r.queued ? "Saved offline — will sync when online" : "Processing step recorded");
    load();
  }

  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${activeLots.length} active lots · ${fmtGrams(totalWeight)} in stock`} />

      {msg && <p className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" onClick={() => setMsg(null)}>{msg}</p>}

      {lots!.length === 0 ? (
        <EmptyState icon="📦" title="No inventory lots" hint="Lots are created automatically when you record a harvest" />
      ) : (
        <div className="space-y-3">
          {lots!.map((l) => (
            <Card key={l.id} onClick={() => setSelected(l)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-gray-900">{l.code}</p>
                  <p className="text-sm text-gray-500">
                    {PRODUCT_LABELS[l.product]} · {fmtGrams(l.weightGrams)}
                    {l.harvest ? ` · ${l.harvest.batch.strain.name}` : ""}
                  </p>
                </div>
                <Badge className={STATUS_COLORS[l.status]}>{LOT_STATUS_LABELS[l.status]}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                {l.storageLocation && <span>📍 {l.storageLocation}</span>}
                {l.packagedUnits && <span>📦 {l.packagedUnits} units</span>}
                <span>Created {format(new Date(l.createdAt), "d MMM yyyy")}</span>
                {l.harvest && <span>From {l.harvest.batch.code}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected ? `Process ${selected.code}` : ""}>
        {selected && (
          <div>
            {selected.processing.length > 0 && (
              <div className="mb-4 rounded-xl bg-gray-50 p-3">
                <p className="mb-1 text-xs font-bold uppercase text-gray-400">Processing history</p>
                {selected.processing.map((p) => (
                  <p key={p.id} className="text-sm text-gray-600">
                    {p.type} · {format(new Date(p.startedAt), "d MMM")}
                    {p.outputWeightG ? ` · out ${fmtGrams(p.outputWeightG)}` : " · in progress"}
                  </p>
                ))}
              </div>
            )}
            <form onSubmit={recordProcessing} className="space-y-4">
              <Field label="Processing step">
                <Select value={proc.type} onChange={(e) => setProc({ ...proc, type: e.target.value })}>
                  <option value="drying">Drying</option>
                  <option value="curing">Curing</option>
                  <option value="trimming">Trimming</option>
                  <option value="extraction">Extraction</option>
                  <option value="packaging">Packaging</option>
                </Select>
              </Field>
              <Field label="Output weight (g)" hint="Leave blank if the step is still in progress">
                <Input type="number" step="0.1" inputMode="decimal" value={proc.outputWeightG} onChange={(e) => setProc({ ...proc, outputWeightG: e.target.value })} />
              </Field>
              <Field label="Storage location (optional)">
                <Input value={proc.storageLocation} onChange={(e) => setProc({ ...proc, storageLocation: e.target.value })} placeholder="Vault A, shelf 2" />
              </Field>
              <Field label="Notes (optional)">
                <Textarea value={proc.notes} onChange={(e) => setProc({ ...proc, notes: e.target.value })} />
              </Field>
              <Button type="submit" size="lg">Record step</Button>
            </form>
          </div>
        )}
      </Sheet>
    </div>
  );
}
