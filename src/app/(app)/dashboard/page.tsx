"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { useFarm } from "@/components/FarmContext";
import { Card, Spinner, StatCard, EmptyState, PageHeader, Badge } from "@/components/ui";
import { apiGet } from "@/lib/offline";
import { STAGE_LABELS, HEALTH_LABELS, INPUT_TYPE_LABELS, fmtGrams, fmtRands } from "@/lib/constants";
import { format } from "date-fns";

type Dash = {
  totals: {
    activePlants: number; activeBatches: number; openTasks: number; overdueTasks: number;
    totalDryYieldG: number; totalWetYieldG: number; totalCostRands: number;
    inventoryWeightG: number; wasteEvents: number;
  };
  batchesByStage: { stage: string; batches: number; plants: number }[];
  plantsByHealth: { health: string; plants: number }[];
  harvests: { date: string; batchCode: string; wetWeightG: number; dryWeightG: number | null }[];
  costsByType: { type: string; costRands: number }[];
  costByMonth: { month: string; cost: number }[];
  compliance: { status: string; count: number }[];
  recentEvents: { id: string; type: string; note: string | null; at: string; batchCode?: string }[];
  expiringDocs: { id: string; title: string; type: string; expiryDate: string }[];
  farms: { id: string; name: string; licenceNumber: string | null; licenceExpiry: string | null }[];
};

const HEALTH_CHART_COLORS: Record<string, string> = {
  HEALTHY: "#388e3b", NEEDS_ATTENTION: "#f59e0b", PEST: "#f97316",
  DISEASE: "#dc2626", NUTRIENT_DEFICIENCY: "#eab308", QUARANTINE: "#c026d3", DEAD: "#6b7280",
};

export default function DashboardPage() {
  const { farm, loading: farmLoading } = useFarm();
  const [data, setData] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farm) return;
    setLoading(true);
    apiGet<Dash>(`/api/dashboard?farmId=${farm.id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [farm]);

  if (farmLoading) return <Spinner />;
  if (!farm) {
    return (
      <div>
        <EmptyState
          icon="🚜"
          title="Welcome to KhulaGrow"
          hint="Add your first farm to start tracking cultivation"
        />
        <div className="mx-auto flex max-w-xs flex-col gap-2">
          <Link
            href="/farms/new"
            className="rounded-xl bg-brand-700 px-6 py-3.5 text-center font-bold text-white active:bg-brand-800"
          >
            + Add your farm
          </Link>
          <Link
            href="/help"
            className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-center font-semibold text-gray-700 active:bg-gray-50"
          >
            See how KhulaGrow works
          </Link>
        </div>
      </div>
    );
  }
  if (loading || !data) return <Spinner />;

  const t = data.totals;
  const actionRequired = data.compliance.filter((c) => c.status !== "COMPLIANT").reduce((s, c) => s + c.count, 0);
  const licence = data.farms.find((f) => f.id === farm.id);
  const licenceDays = licence?.licenceExpiry
    ? Math.ceil((new Date(licence.licenceExpiry).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="space-y-4">
      <PageHeader title={farm.name} subtitle={licence?.licenceNumber ? `Licence ${licence.licenceNumber}` : undefined} />

      {/* Alerts */}
      {(t.overdueTasks > 0 || actionRequired > 0 || (licenceDays !== null && licenceDays < 60) || data.expiringDocs.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="mb-1 text-sm font-bold text-amber-900">⚠️ Needs attention</p>
          <ul className="space-y-1 text-sm text-amber-800">
            {licenceDays !== null && licenceDays < 60 && (
              <li>SAHPRA licence expires in {licenceDays} days</li>
            )}
            {t.overdueTasks > 0 && <li><Link className="underline" href="/tasks">{t.overdueTasks} overdue task{t.overdueTasks > 1 ? "s" : ""}</Link></li>}
            {actionRequired > 0 && <li><Link className="underline" href="/compliance">{actionRequired} compliance item{actionRequired > 1 ? "s" : ""} need action</Link></li>}
            {data.expiringDocs.map((d) => (
              <li key={d.id}>{d.title} expires {format(new Date(d.expiryDate), "d MMM yyyy")}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Active plants" value={t.activePlants.toLocaleString()} sub={`${t.activeBatches} batches`} tone="ok" />
        <StatCard label="Open tasks" value={String(t.openTasks)} sub={t.overdueTasks ? `${t.overdueTasks} overdue` : "none overdue"} tone={t.overdueTasks ? "warn" : undefined} />
        <StatCard label="Dry yield to date" value={fmtGrams(t.totalDryYieldG)} sub={`wet ${fmtGrams(t.totalWetYieldG)}`} />
        <StatCard label="Input costs" value={fmtRands(t.totalCostRands)} sub="all time" />
        <StatCard label="Inventory" value={fmtGrams(t.inventoryWeightG)} sub="in stock" />
        <StatCard label="Destruction events" value={String(t.wasteEvents)} sub="logged" />
      </div>

      {/* Plants by stage */}
      {data.batchesByStage.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-bold text-gray-700">Plants by stage</h3>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={data.batchesByStage.map((b) => ({ ...b, name: STAGE_LABELS[b.stage] ?? b.stage }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={36} />
                <Tooltip />
                <Bar dataKey="plants" fill="#388e3b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Health + Costs */}
      <div className="grid gap-4 md:grid-cols-2">
        {data.plantsByHealth.length > 0 && (
          <Card>
            <h3 className="mb-2 text-sm font-bold text-gray-700">Plant health</h3>
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.plantsByHealth.map((h) => ({ name: HEALTH_LABELS[h.health] ?? h.health, value: h.plants, health: h.health }))}
                    dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}
                  >
                    {data.plantsByHealth.map((h) => (
                      <Cell key={h.health} fill={HEALTH_CHART_COLORS[h.health] ?? "#9ca3af"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {data.plantsByHealth.map((h) => (
                <Badge key={h.health} className="bg-gray-100 text-gray-700">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: HEALTH_CHART_COLORS[h.health] }} />
                  {HEALTH_LABELS[h.health]}: {h.plants}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {data.costByMonth.length > 0 && (
          <Card>
            <h3 className="mb-2 text-sm font-bold text-gray-700">Monthly input costs (R)</h3>
            <div className="h-44">
              <ResponsiveContainer>
                <LineChart data={data.costByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={50} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="#215c24" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Yields per harvest */}
      {data.harvests.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-bold text-gray-700">Harvest yields (g)</h3>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={data.harvests.map((h) => ({ name: h.batchCode, wet: h.wetWeightG, dry: h.dryWeightG ?? 0 }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={44} />
                <Tooltip />
                <Bar dataKey="wet" fill="#8ec78f" radius={[6, 6, 0, 0]} name="Wet" />
                <Bar dataKey="dry" fill="#215c24" radius={[6, 6, 0, 0]} name="Dry" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Cost breakdown */}
      {data.costsByType.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-bold text-gray-700">Cost breakdown</h3>
          <div className="space-y-2">
            {data.costsByType
              .filter((c) => c.costRands > 0)
              .sort((a, b) => b.costRands - a.costRands)
              .map((c) => {
                const max = Math.max(...data.costsByType.map((x) => x.costRands));
                return (
                  <div key={c.type} className="flex items-center gap-2 text-sm">
                    <span className="w-28 shrink-0 text-gray-600">{INPUT_TYPE_LABELS[c.type]}</span>
                    <div className="h-2.5 flex-1 rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(c.costRands / max) * 100}%` }} />
                    </div>
                    <span className="w-24 shrink-0 text-right font-medium">{fmtRands(c.costRands)}</span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Recent activity */}
      <Card>
        <h3 className="mb-2 text-sm font-bold text-gray-700">Recent activity</h3>
        {data.recentEvents.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No activity yet</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {data.recentEvents.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-2 py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-800">{e.batchCode}</span>{" "}
                  <span className="text-gray-500">{e.note ?? e.type}</span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{format(new Date(e.at), "d MMM HH:mm")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
