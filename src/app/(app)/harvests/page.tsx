"use client";

import { useEffect, useState } from "react";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Spinner, EmptyState, Badge } from "@/components/ui";
import { apiGet } from "@/lib/offline";
import { fmtGrams, LOT_STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";

type HarvestRow = {
  id: string; date: string; plantCount: number; wetWeightG: number; dryWeightG: number | null;
  notes: string | null;
  batch: { code: string; strain: { name: string } };
  lots: { id: string; code: string; status: string }[];
};

export default function HarvestsPage() {
  const { farm, loading } = useFarm();
  const [rows, setRows] = useState<HarvestRow[] | null>(null);

  useEffect(() => {
    if (!farm) return;
    apiGet<HarvestRow[]>(`/api/harvests?farmId=${farm.id}`).then(setRows).catch(() => setRows([]));
  }, [farm]);

  if (loading || (farm && !rows)) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  const totalWet = rows!.reduce((s, r) => s + r.wetWeightG, 0);
  const totalDry = rows!.reduce((s, r) => s + (r.dryWeightG ?? 0), 0);

  return (
    <div>
      <PageHeader title="Harvests" subtitle={rows!.length ? `${fmtGrams(totalWet)} wet · ${fmtGrams(totalDry)} dry to date` : undefined} />
      {rows!.length === 0 ? (
        <EmptyState icon="✂️" title="No harvests yet" hint="Record a harvest from a batch page" />
      ) : (
        <div className="space-y-3">
          {rows!.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{h.batch.code}</p>
                  <p className="text-sm text-gray-500">{h.batch.strain.name} · {h.plantCount} plants</p>
                </div>
                <span className="text-xs text-gray-400">{format(new Date(h.date), "d MMM yyyy")}</span>
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <span>Wet: <b>{fmtGrams(h.wetWeightG)}</b></span>
                <span>Dry: <b>{fmtGrams(h.dryWeightG)}</b></span>
                {h.dryWeightG && (
                  <span className="text-gray-400">{((h.dryWeightG / h.wetWeightG) * 100).toFixed(0)}% yield</span>
                )}
              </div>
              {h.lots.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {h.lots.map((l) => (
                    <Badge key={l.id} className="bg-blue-50 text-blue-800 font-mono">
                      {l.code} · {LOT_STATUS_LABELS[l.status]}
                    </Badge>
                  ))}
                </div>
              )}
              {h.notes && <p className="mt-2 text-sm text-gray-500">{h.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
