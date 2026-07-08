"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Button, Spinner, EmptyState, Badge, cn } from "@/components/ui";
import { apiGet } from "@/lib/offline";
import { STAGE_LABELS, STAGE_COLORS, HEALTH_LABELS, HEALTH_COLORS } from "@/lib/constants";
import { formatDistanceToNowStrict } from "date-fns";

type BatchRow = {
  id: string; code: string; stage: string; health: string; plantCount: number;
  startDate: string; source: string;
  strain: { name: string; type: string };
  area: { name: string } | null;
  _count: { plants: number; harvests: number };
};

const FILTERS = ["ACTIVE", "ALL", "HARVESTED"] as const;

export default function BatchesPage() {
  const { farm, loading } = useFarm();
  const [batches, setBatches] = useState<BatchRow[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ACTIVE");

  useEffect(() => {
    if (!farm) return;
    setBatches(null);
    apiGet<BatchRow[]>(`/api/batches?farmId=${farm.id}`).then(setBatches).catch(() => setBatches([]));
  }, [farm]);

  if (loading || (farm && !batches)) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  const filtered = batches!.filter((b) =>
    filter === "ALL" ? true :
    filter === "HARVESTED" ? b.stage === "HARVESTED" :
    !["HARVESTED", "DESTROYED"].includes(b.stage)
  );

  return (
    <div>
      <PageHeader
        title="Batches"
        action={<Link href="/batches/new"><Button size="sm">+ New batch</Button></Link>}
      />

      <div className="mb-4 grid grid-cols-3 rounded-xl bg-gray-100 p-1 text-sm font-semibold">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-lg py-1.5 capitalize", filter === f ? "bg-white text-brand-800 shadow-sm" : "text-gray-500")}>
            {f.toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🌿" title="No batches" hint="Start a batch from seed or clone" />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Link key={b.id} href={`/batches/${b.id}`} className="block">
              <Card className="active:scale-[0.99] transition-transform">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{b.code}</p>
                    <p className="text-sm text-gray-500">
                      {b.strain.name} · {b.plantCount} plants
                      {b.area ? ` · ${b.area.name}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={STAGE_COLORS[b.stage]}>{STAGE_LABELS[b.stage]}</Badge>
                    {b.health !== "HEALTHY" && (
                      <Badge className={HEALTH_COLORS[b.health]}>{HEALTH_LABELS[b.health]}</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Started {formatDistanceToNowStrict(new Date(b.startDate))} ago · from {b.source.toLowerCase()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
