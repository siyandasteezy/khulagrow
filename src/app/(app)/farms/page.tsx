"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Button, Spinner, EmptyState, Badge } from "@/components/ui";
import { apiGet } from "@/lib/offline";
import { ROLE_LABELS } from "@/lib/constants";

type FarmRow = {
  id: string; name: string; licenceNumber: string | null; address: string | null;
  latitude: number | null; longitude: number | null; sizeHectares: number | null;
  role: string; counts: { batches: number; areas: number; tasks: number };
};

export default function FarmsPage() {
  const { refreshFarms } = useFarm();
  const [farms, setFarms] = useState<FarmRow[] | null>(null);

  useEffect(() => {
    apiGet<FarmRow[]>("/api/farms").then(setFarms).catch(() => setFarms([]));
    refreshFarms();
  }, [refreshFarms]);

  if (!farms) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Farms"
        action={<Link href="/farms/new"><Button size="sm">+ New farm</Button></Link>}
      />
      {farms.length === 0 ? (
        <EmptyState icon="🚜" title="No farms yet" hint="Create your first farm to get started" />
      ) : (
        <div className="space-y-3">
          {farms.map((f) => (
            <Link key={f.id} href={`/farms/${f.id}`} className="block">
              <Card className="active:scale-[0.99] transition-transform">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{f.name}</p>
                    {f.address && <p className="text-sm text-gray-500">{f.address}</p>}
                    {f.licenceNumber && (
                      <p className="mt-0.5 text-xs text-gray-400">Licence {f.licenceNumber}</p>
                    )}
                  </div>
                  <Badge className="bg-brand-50 text-brand-800">{ROLE_LABELS[f.role]}</Badge>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>🌿 {f.counts.batches} batches</span>
                  <span>📍 {f.counts.areas} areas</span>
                  {f.sizeHectares && <span>📐 {f.sizeHectares} ha</span>}
                  {f.latitude && <span>🗺️ GPS set</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
