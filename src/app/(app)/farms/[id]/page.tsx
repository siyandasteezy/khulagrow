"use client";

import { useCallback, useEffect, useState, use } from "react";
import { Card, PageHeader, Button, Spinner, Badge, Sheet, Field, Input, Select } from "@/components/ui";
import { apiGet, apiMutate } from "@/lib/offline";
import { AREA_TYPE_LABELS, ROLE_LABELS, SENSOR_TYPE_LABELS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";

type SensorRow = {
  id: string;
  name: string;
  type: string;
  apiKey: string;
  active: boolean;
  lastSeenAt: string | null;
  area: { id: string; name: string };
  latest: { tempC: number | null; humidity: number | null; ph: number | null; ec: number | null; co2Ppm: number | null; at: string } | null;
};

function sensorStatus(s: SensorRow): { label: string; cls: string } {
  if (!s.active) return { label: "Off", cls: "bg-gray-100 text-gray-500" };
  if (!s.lastSeenAt) return { label: "Waiting for data", cls: "bg-amber-100 text-amber-800" };
  const ageMin = (Date.now() - new Date(s.lastSeenAt).getTime()) / 60_000;
  if (ageMin < 60) return { label: "Online", cls: "bg-green-100 text-green-800" };
  return {
    label: `Silent ${formatDistanceToNow(new Date(s.lastSeenAt))}`,
    cls: "bg-red-100 text-red-700",
  };
}

function latestSummary(l: SensorRow["latest"]): string | null {
  if (!l) return null;
  const parts = [
    l.tempC != null ? `${l.tempC}°C` : null,
    l.humidity != null ? `${l.humidity}% RH` : null,
    l.ph != null ? `pH ${l.ph}` : null,
    l.ec != null ? `EC ${l.ec}` : null,
    l.co2Ppm != null ? `${l.co2Ppm} ppm CO₂` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

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
  const [sensors, setSensors] = useState<SensorRow[]>([]);
  const [sheet, setSheet] = useState<"area" | "member" | "sensor" | null>(null);
  const [areaForm, setAreaForm] = useState({ name: "", type: "TUNNEL", widthM: "", lengthM: "", capacity: "", bedCount: "" });
  const [memberForm, setMemberForm] = useState({ email: "", role: "WORKER" });
  const [sensorForm, setSensorForm] = useState({ name: "", type: "TEMP_HUMIDITY", areaId: "" });
  const [manageSensor, setManageSensor] = useState<SensorRow | null>(null);
  const [newKey, setNewKey] = useState<{ name: string; apiKey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    apiGet<FarmDetail>(`/api/farms/${id}`).then(setFarm).catch(() => {});
    apiGet<SensorRow[]>(`/api/sensors?farmId=${id}`).then(setSensors).catch(() => {});
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

  async function addSensor(e: React.FormEvent) {
    e.preventDefault();
    const result = await apiMutate<SensorRow>("/api/sensors", "POST", { farmId: id, ...sensorForm });
    if (result.error) { setMsg(result.error); return; }
    setSheet(null);
    setSensorForm({ name: "", type: "TEMP_HUMIDITY", areaId: "" });
    if (result.data) setNewKey({ name: result.data.name, apiKey: result.data.apiKey });
    load();
  }

  async function patchSensor(sensorId: string, patch: Record<string, unknown>) {
    const result = await apiMutate<SensorRow>(`/api/sensors/${sensorId}`, "PATCH", patch);
    if (result.error) { setMsg(result.error); return; }
    if (patch.rotateKey && result.data) {
      setManageSensor(null);
      setNewKey({ name: result.data.name, apiKey: result.data.apiKey });
    } else {
      setManageSensor(null);
    }
    load();
  }

  async function deleteSensor(sensorId: string) {
    if (!confirm("Remove this sensor? Its readings stay in your records.")) return;
    const result = await apiMutate(`/api/sensors/${sensorId}`, "DELETE");
    if (result.error) { setMsg(result.error); return; }
    setManageSensor(null);
    load();
  }

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <span className="font-data font-medium">
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
        <h2 className="font-bold text-gray-800">Sensors</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSensorForm({ ...sensorForm, areaId: farm.areas[0]?.id ?? "" });
            setSheet("sensor");
          }}
          disabled={farm.areas.length === 0}
        >
          + Add sensor
        </Button>
      </div>
      {sensors.length === 0 ? (
        <p className="text-sm text-gray-400">
          {farm.areas.length === 0
            ? "Add a growing area first, then connect sensors to it."
            : "No sensors yet — connect temperature, humidity, pH, EC or CO₂ probes and readings record themselves."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sensors.map((s) => {
            const status = sensorStatus(s);
            const summary = latestSummary(s.latest);
            return (
              <Card key={s.id} className="p-3.5" onClick={() => setManageSensor(s)}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">📡 {s.name}</p>
                  <Badge className={status.cls}>{status.label}</Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {SENSOR_TYPE_LABELS[s.type]} · {s.area.name}
                </p>
                {summary && (
                  <p className="mt-2 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-800">
                    {summary}
                    <span className="ml-1 font-normal text-brand-600">
                      · {formatDistanceToNow(new Date(s.latest!.at), { addSuffix: true })}
                    </span>
                  </p>
                )}
              </Card>
            );
          })}
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

      <Sheet open={sheet === "sensor"} onClose={() => setSheet(null)} title="Add sensor">
        <form onSubmit={addSensor} className="space-y-4">
          <Field label="Name" hint="Something you'll recognise, e.g. 'Tunnel 2 climate probe'">
            <Input required value={sensorForm.name} onChange={(e) => setSensorForm({ ...sensorForm, name: e.target.value })} placeholder="Tunnel 2 climate probe" />
          </Field>
          <Field label="Measures">
            <Select value={sensorForm.type} onChange={(e) => setSensorForm({ ...sensorForm, type: e.target.value })}>
              {Object.entries(SENSOR_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Location">
            <Select required value={sensorForm.areaId} onChange={(e) => setSensorForm({ ...sensorForm, areaId: e.target.value })}>
              {farm.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </Field>
          <Button type="submit" size="lg">Add sensor</Button>
        </form>
      </Sheet>

      <Sheet open={newKey !== null} onClose={() => setNewKey(null)} title="Sensor connected 🎉">
        {newKey && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <b>{newKey.name}</b> is registered. Point the device (or its integration) at this
              endpoint with the API key below:
            </p>
            <div className="rounded-xl bg-gray-50 p-3.5 text-xs">
              <p className="font-semibold text-gray-500">Endpoint</p>
              <p className="mt-0.5 break-all font-data">{`POST ${window.location.origin}/api/ingest`}</p>
              <p className="mt-3 font-semibold text-gray-500">API key (Authorization: Bearer …)</p>
              <p className="mt-0.5 break-all font-data">{newKey.apiKey}</p>
              <p className="mt-3 font-semibold text-gray-500">Example</p>
              <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap break-all font-data text-[10px] leading-relaxed">{`curl -X POST ${window.location.origin}/api/ingest \\
  -H "Authorization: Bearer ${newKey.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"tempC": 24.5, "humidity": 61}'`}</pre>
            </div>
            <Button size="lg" onClick={() => copyKey(newKey.apiKey)}>
              {copied ? "✓ Copied" : "Copy API key"}
            </Button>
            <p className="text-xs text-gray-400">
              You can view or rotate this key any time by tapping the sensor.
            </p>
          </div>
        )}
      </Sheet>

      <Sheet open={manageSensor !== null} onClose={() => setManageSensor(null)} title={manageSensor ? `📡 ${manageSensor.name}` : ""}>
        {manageSensor && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-3.5 text-xs">
              <p className="font-semibold text-gray-500">API key</p>
              <p className="mt-0.5 break-all font-data">{manageSensor.apiKey}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => copyKey(manageSensor.apiKey)}>
                {copied ? "✓ Copied" : "Copy key"}
              </Button>
              <Button variant="secondary" onClick={() => patchSensor(manageSensor.id, { rotateKey: true })}>
                Rotate key
              </Button>
              <Button variant="secondary" onClick={() => patchSensor(manageSensor.id, { active: !manageSensor.active })}>
                {manageSensor.active ? "Pause sensor" : "Resume sensor"}
              </Button>
              <button
                onClick={() => deleteSensor(manageSensor.id)}
                className="rounded-xl border border-red-100 bg-white py-2.5 text-sm font-semibold text-red-600 active:bg-red-50"
              >
                Remove
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Rotate the key if a device is lost or the key leaks — the old key stops working
              immediately. Removing a sensor keeps all its readings in your records.
            </p>
          </div>
        )}
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
