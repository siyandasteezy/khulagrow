"use client";

import { useEffect, useState } from "react";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Spinner, EmptyState, Badge } from "@/components/ui";
import { apiGet } from "@/lib/offline";
import { format } from "date-fns";

type AuditRow = {
  id: string; action: string; entity: string; entityId: string | null;
  detail: Record<string, unknown> | null; at: string;
  user: { name: string; email: string } | null;
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  LOGIN: "bg-gray-100 text-gray-600",
  EXPORT: "bg-purple-100 text-purple-800",
};

export default function AuditPage() {
  const { farm, loading } = useFarm();
  const [rows, setRows] = useState<AuditRow[] | null>(null);

  useEffect(() => {
    if (!farm) return;
    apiGet<AuditRow[]>(`/api/audit?farmId=${farm.id}`).then(setRows).catch(() => setRows([]));
  }, [farm]);

  if (loading || (farm && !rows)) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  return (
    <div>
      <PageHeader title="Audit trail" subtitle="Append-only record of all activity" />
      {rows!.length === 0 ? (
        <EmptyState icon="🔍" title="No audit entries" />
      ) : (
        <Card className="divide-y divide-gray-50 p-0">
          {rows!.map((r) => (
            <div key={r.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={ACTION_COLORS[r.action] ?? "bg-gray-100 text-gray-600"}>{r.action}</Badge>
                  <span className="text-sm font-medium text-gray-800">{r.entity}</span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{format(new Date(r.at), "d MMM HH:mm")}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">
                {r.user?.name ?? "System"}
                {r.detail ? ` · ${Object.entries(r.detail).filter(([, v]) => v != null).map(([k, v]) => `${k}: ${v}`).join(", ")}` : ""}
              </p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
