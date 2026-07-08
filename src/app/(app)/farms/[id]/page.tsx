"use client";

import { useCallback, useEffect, useState, use } from "react";
import { Card, PageHeader, Button, Spinner, Badge, Sheet, Field, Input, Select } from "@/components/ui";
import { apiGet, apiMutate } from "@/lib/offline";
import { AREA_TYPE_LABELS, ROLE_LABELS } from "@/lib/constants";

type FarmDetail = {
  id: string; name: string; licenceNumber: string | null; address: string | null;
  latitude: number | null; longitude: number | null; sizeHectares: number | null;
  areas: { id: string; name: string; type: string; widthM: number | null; lengthM: number | null; capacity: number | null; beds: { id: string; name: string }[]; _count: { batches: number } }[];
  members: { id: string; role: string; user: { id: string; name: string; email: string } }[];
  _count: { batches: number; harvests: number; inventory: number; documents: number };
};

export default function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [farm, setFarm] = useState<FarmDetail | null>(null);
  const [sheet, setSheet] = useState<"area" | "member" | null>(null);
  const [areaForm, setAreaForm] = useState({ name: "", type: "TUNNEL", widthM: "", lengthM: "", capacity: "", bedCount: "" });
  const [memberForm, setMemberForm] = useState({ email: "", role: "WORKER" });
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    apiGet<FarmDetail>(`/api/farms/${id}`).then(setFarm).catch(() => {});
  }, [id]);
  useEffect(load, [load]);

  if (!farm) return <Spinner />;

  async function addArea(e: React.FormEvent) {
    e.preventDefault();
    const bedCount = Number(areaForm.bedCount) || 0;
    const result = await apiMutate("/api/areas", "POST", {
      farmId: id,
      name: areaForm.name,
      type: areaForm.type,
      widthM: areaForm.widthM ? Number(areaForm.widthM) : undefined,
      lengthM: areaForm.lengthM ? Number(areaForm.lengthM) : undefined,
      capacity: areaForm.capacity ? Number(areaForm.capacity) : undefined,
      beds: bedCount > 0 ? Array.from({ length: bedCount }, (_, i) => ({ name: `Bed ${i + 1}` })) : undefined,
    });
    if (result.error) { setMsg(result.error); return; }
    setSheet(null);
    setAreaForm({ name: "", type: "TUNNEL", widthM: "", lengthM: "", capacity: "", bedCount: "" });
    setMsg(result.queued ? "Saved offline — will sync when online" : null);
    load();
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const result = await apiMutate(`/api/farms/${id}/members`, "POST", memberForm);
    if (result.error) { setMsg(result.error); return; }
    setSheet(null);
    setMemberForm({ email: "", role: "WORKER" });
    load();
  }

  return (
    <div className="space-y-4">
      <PageHeader title={farm.name} subtitle={farm.address ?? undefined} />

      {msg && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{msg}</p>}

      <Card>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">Licence</span>
          <span className="font-medium">{farm.licenceNumber ?? "—"}</span>
          <span className="text-gray-500">Size</span>
          <span className="font-medium">{farm.sizeHectares ? `${farm.sizeHectares} ha` : "—"}</span>
          <span className="text-gray-500">GPS</span>
          <span className="font-medium">
            {farm.latitude ? `${farm.latitude.toFixed(5)}, ${farm.longitude?.toFixed(5)}` : "—"}
          </span>
          <span className="text-gray-500">Records</span>
          <span className="font-medium">
            {farm._count.batches} batches · {farm._count.harvests} harvests · {farm._count.documents} docs
          </span>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">Growing areas</h2>
        <Button size="sm" variant="secondary" onClick={() => setSheet("area")}>+ Add area</Button>
      </div>
      {farm.areas.length === 0 ? (
        <p className="text-sm text-gray-400">No areas yet — add blocks, tunnels or rooms.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {farm.areas.map((a) => (
            <Card key={a.id} className="p-3.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{a.name}</p>
                <Badge className="bg-brand-50 text-brand-800">{AREA_TYPE_LABELS[a.type]}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {a.widthM && a.lengthM ? `${a.widthM}×${a.lengthM} m · ` : ""}
                {a.beds.length > 0 ? `${a.beds.length} beds · ` : ""}
                {a.capacity ? `capacity ${a.capacity} · ` : ""}
                {a._count.batches} active batches
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">Team</h2>
        <Button size="sm" variant="secondary" onClick={() => setSheet("member")}>+ Add member</Button>
      </div>
      <Card className="divide-y divide-gray-50 p-0">
        {farm.members.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
              <p className="text-xs text-gray-400">{m.user.email}</p>
            </div>
            <Badge className="bg-gray-100 text-gray-700">{ROLE_LABELS[m.role]}</Badge>
          </div>
        ))}
      </Card>

      <Sheet open={sheet === "area"} onClose={() => setSheet(null)} title="Add growing area">
        <form onSubmit={addArea} className="space-y-4">
          <Field label="Name">
            <Input required value={areaForm.name} onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })} placeholder="Tunnel 1" />
          </Field>
          <Field label="Type">
            <Select value={areaForm.type} onChange={(e) => setAreaForm({ ...areaForm, type: e.target.value })}>
              {Object.entries(AREA_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Width (m)"><Input type="number" step="0.1" inputMode="decimal" value={areaForm.widthM} onChange={(e) => setAreaForm({ ...areaForm, widthM: e.target.value })} /></Field>
            <Field label="Length (m)"><Input type="number" step="0.1" inputMode="decimal" value={areaForm.lengthM} onChange={(e) => setAreaForm({ ...areaForm, lengthM: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plant capacity"><Input type="number" inputMode="numeric" value={areaForm.capacity} onChange={(e) => setAreaForm({ ...areaForm, capacity: e.target.value })} /></Field>
            <Field label="Number of beds"><Input type="number" inputMode="numeric" value={areaForm.bedCount} onChange={(e) => setAreaForm({ ...areaForm, bedCount: e.target.value })} /></Field>
          </div>
          <Button type="submit" size="lg">Add area</Button>
        </form>
      </Sheet>

      <Sheet open={sheet === "member"} onClose={() => setSheet(null)} title="Add team member">
        <form onSubmit={addMember} className="space-y-4">
          <Field label="Email" hint="They must already have a KhulaGrow account">
            <Input required type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
              {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Button type="submit" size="lg">Add member</Button>
        </form>
      </Sheet>
    </div>
  );
}
