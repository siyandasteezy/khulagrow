"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFarm } from "@/components/FarmContext";
import { Button, Card, Field, Input, PageHeader } from "@/components/ui";

export default function NewFarmPage() {
  const router = useRouter();
  const { refreshFarms, setFarmId } = useFarm();
  const [form, setForm] = useState({
    name: "", licenceNumber: "", address: "", sizeHectares: "",
    latitude: null as number | null, longitude: null as number | null,
  });
  const [gpsBusy, setGpsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function captureGPS() {
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setGpsBusy(false);
      },
      () => {
        setError("Could not read GPS — check location permissions");
        setGpsBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/farms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        licenceNumber: form.licenceNumber || undefined,
        address: form.address || undefined,
        sizeHectares: form.sizeHectares ? Number(form.sizeHectares) : undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create farm");
      return;
    }
    await refreshFarms();
    setFarmId(data.id);
    router.push(`/farms/${data.id}`);
  }

  return (
    <div>
      <PageHeader title="New farm" />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Farm name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Highveld Cultivation Site A" />
          </Field>
          <Field label="SAHPRA licence number" hint="Section 22C(1)(b) cultivation licence">
            <Input value={form.licenceNumber} onChange={(e) => setForm({ ...form, licenceNumber: e.target.value })} placeholder="SAHPRA/CUL/2026/0000" />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Farm road, district, province" />
          </Field>
          <Field label="Size (hectares)">
            <Input type="number" step="0.01" inputMode="decimal" value={form.sizeHectares} onChange={(e) => setForm({ ...form, sizeHectares: e.target.value })} placeholder="2.5" />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700">GPS location</span>
            <Button type="button" variant="secondary" onClick={captureGPS} disabled={gpsBusy} className="w-full">
              {gpsBusy ? "Reading GPS…" : form.latitude ? `📍 ${form.latitude.toFixed(5)}, ${form.longitude?.toFixed(5)} — tap to re-capture` : "📍 Capture current location"}
            </Button>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Creating…" : "Create farm"}</Button>
        </form>
      </Card>
    </div>
  );
}
