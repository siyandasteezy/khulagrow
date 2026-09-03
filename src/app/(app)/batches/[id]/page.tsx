"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, PageHeader, Button, Spinner, Badge, Sheet, Field, Input, Select, Textarea, cn } from "@/components/ui";
import { apiGet, apiMutate } from "@/lib/offline";
import { STAGE_LABELS, STAGE_COLORS, HEALTH_LABELS, HEALTH_COLORS, WASTE_REASON_LABELS } from "@/lib/constants";
import { format, differenceInDays } from "date-fns";

type BatchDetail = {
  id: string; code: string; stage: string; health: string; plantCount: number;
  source: string; startDate: string; notes: string | null; farmId: string;
  strain: { name: string; type: string; floweringDays: number | null };
  area: { id: string; name: string } | null;
  farm: { id: string; name: string };
  plants: { id: string; tag: string; stage: string; health: string }[];
  events: { id: string; type: string; stage: string | null; health: string | null; note: string | null; photoUrl: string | null; at: string }[];
  harvests: { id: string; date: string; wetWeightG: number; dryWeightG: number | null }[];
};

const STAGES = ["GERMINATION", "CLONE", "SEEDLING", "VEGETATIVE", "FLOWERING"];
type SheetKind = "stage" | "health" | "note" | "photo" | "harvest" | "waste" | null;

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [health, setHealth] = useState({ status: "HEALTHY", note: "" });
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<{ file: File | null; note: string }>({ file: null, note: "" });
  const [harvest, setHarvest] = useState({ plantCount: "", wetWeightG: "", notes: "" });
  const [waste, setWaste] = useState({ reason: "DISEASED", plantCount: "", weightGrams: "", method: "Shredded and composted on site", witnessName: "", notes: "" });

  const load = useCallback(() => {
    apiGet<BatchDetail>(`/api/batches/${id}`).then(setBatch).catch(() => {});
  }, [id]);
  useEffect(load, [load]);

  if (!batch) return <Spinner />;

  const days = differenceInDays(new Date(), new Date(batch.startDate));
  const active = !["HARVESTED", "DESTROYED"].includes(batch.stage);

  async function setStage(stage: string) {
    setBusy(true);
    const r = await apiMutate(`/api/batches/${id}`, "PUT", { stage });
    setBusy(false);
    setSheet(null);
    setMsg(r.queued ? "Saved offline — will sync when online" : r.error ?? null);
    load();
  }

  async function submitHealth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await apiMutate(`/api/batches/${id}/events`, "POST", {
      type: "HEALTH_CHECK", health: health.status, note: health.note || undefined,
    });
    setBusy(false);
    setSheet(null);
    setMsg(r.queued ? "Saved offline — will sync when online" : r.error ?? null);
    load();
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await apiMutate(`/api/batches/${id}/events`, "POST", { type: "NOTE", note });
    setBusy(false);
    setSheet(null);
    setNote("");
    setMsg(r.queued ? "Saved offline — will sync when online" : r.error ?? null);
    load();
  }

  async function submitPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!photo.file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", photo.file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) { setMsg(upData.error); setBusy(false); return; }
      await apiMutate(`/api/batches/${id}/events`, "POST", {
        type: "PHOTO", photoUrl: upData.url, note: photo.note || undefined,
      });
      setSheet(null);
      setPhoto({ file: null, note: "" });
      load();
    } catch {
      setMsg("Photo uploads need a connection — try again when online");
    } finally {
      setBusy(false);
    }
  }

  async function submitHarvest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await apiMutate("/api/harvests", "POST", {
      batchId: id,
      plantCount: Number(harvest.plantCount),
      wetWeightG: Number(harvest.wetWeightG),
      notes: harvest.notes || undefined,
    });
    setBusy(false);
    setSheet(null);
    if (r.error) { setMsg(r.error); return; }
    setMsg(r.queued ? "Saved offline — will sync when online" : "Harvest recorded — inventory lot created");
    load();
  }

  async function submitWaste(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await apiMutate("/api/waste", "POST", {
      farmId: batch!.farmId,
      batchId: id,
      reason: waste.reason,
      plantCount: waste.plantCount ? Number(waste.plantCount) : undefined,
      weightGrams: waste.weightGrams ? Number(waste.weightGrams) : undefined,
      method: waste.method,
      witnessName: waste.witnessName,
      notes: waste.notes || undefined,
    });
    setBusy(false);
    setSheet(null);
    if (r.error) { setMsg(r.error); return; }
    setMsg(r.queued ? "Saved offline — will sync when online" : "Destruction recorded");
    load();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={batch.code}
        subtitle={`${batch.strain.name} · day ${days} · ${batch.plantCount} plants${batch.area ? ` · ${batch.area.name}` : ""}`}
        action={
          <div className="flex flex-col items-end gap-1">
            <Badge className={STAGE_COLORS[batch.stage]}>{STAGE_LABELS[batch.stage]}</Badge>
            <Badge className={HEALTH_COLORS[batch.health]}>{HEALTH_LABELS[batch.health]}</Badge>
          </div>
        }
      />

      {msg && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800" onClick={() => setMsg(null)}>
          {msg}
        </p>
      )}

      {/* Quick actions — big thumb targets for the field */}
      {active && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "stage" as const, icon: "🔄", label: "Stage" },
            { k: "health" as const, icon: "🩺", label: "Health" },
            { k: "photo" as const, icon: "📷", label: "Photo" },
            { k: "note" as const, icon: "📝", label: "Note" },
            { k: "harvest" as const, icon: "✂️", label: "Harvest" },
            { k: "waste" as const, icon: "🗑️", label: "Destroy" },
          ].map((a) => (
            <button key={a.k} onClick={() => setSheet(a.k)}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-gray-100 bg-white text-sm font-semibold text-gray-700 shadow-sm active:scale-95 transition-transform">
              <span className="text-2xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      )}

      <Button variant="secondary" className="w-full"
        onClick={() => router.push(`/log?batchId=${batch.id}`)}>
        🧪 Log an input for this batch
      </Button>

      {/* Timeline */}
      <Card>
        <h3 className="mb-2 text-sm font-bold text-gray-700">Timeline</h3>
        {batch.events.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No events yet</p>
        ) : (
          <ol className="relative ml-3 space-y-4 border-l-2 border-brand-100 pl-4">
            {batch.events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
                <p className="text-xs text-gray-400">{format(new Date(e.at), "d MMM yyyy · HH:mm")}</p>
                <p className="text-sm text-gray-800">
                  {e.type === "PHOTO" && "📷 "}
                  {e.note ?? (e.stage ? `Stage → ${STAGE_LABELS[e.stage]}` : e.health ? `Health → ${HEALTH_LABELS[e.health]}` : e.type)}
                </p>
                {e.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.photoUrl} alt="Plant photo" className="mt-2 max-h-48 rounded-xl object-cover" loading="lazy" />
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* Individually tagged plants */}
      {batch.plants.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-bold text-gray-700">Tagged plants ({batch.plants.length})</h3>
          <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
            {batch.plants.map((p) => (
              <Badge key={p.id} className={cn("font-data", p.stage === "DESTROYED" ? "bg-red-50 text-red-400 line-through" : HEALTH_COLORS[p.health])}>
                {p.tag.split("-").pop()}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* ── Sheets ─────────────────────────────────────── */}

      <Sheet open={sheet === "stage"} onClose={() => setSheet(null)} title="Change growth stage">
        <div className="space-y-2">
          {STAGES.map((s) => (
            <button key={s} disabled={busy || s === batch.stage} onClick={() => setStage(s)}
              className={cn(
                "flex h-14 w-full items-center justify-between rounded-xl border-2 px-4 font-semibold",
                s === batch.stage ? "border-brand-600 bg-brand-50 text-brand-800" : "border-gray-200 text-gray-700 active:bg-gray-50"
              )}>
              {STAGE_LABELS[s]}
              {s === batch.stage && <span className="text-xs font-normal">current</span>}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "health"} onClose={() => setSheet(null)} title="Health check">
        <form onSubmit={submitHealth} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(HEALTH_LABELS).filter(([k]) => k !== "DEAD").map(([v, l]) => (
              <button key={v} type="button" onClick={() => setHealth({ ...health, status: v })}
                className={cn("h-12 rounded-xl border-2 px-2 text-sm font-semibold",
                  health.status === v ? "border-brand-600 bg-brand-50 text-brand-800" : "border-gray-200 text-gray-600")}>
                {l}
              </button>
            ))}
          </div>
          <Field label="Observations (optional)">
            <Textarea value={health.note} onChange={(e) => setHealth({ ...health, note: e.target.value })} placeholder="Spotted leaf yellowing on lower fan leaves…" />
          </Field>
          <Button type="submit" size="lg" disabled={busy}>Record health check</Button>
        </form>
      </Sheet>

      <Sheet open={sheet === "note"} onClose={() => setSheet(null)} title="Add note">
        <form onSubmit={submitNote} className="space-y-4">
          <Textarea required value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you observe or do?" autoFocus />
          <Button type="submit" size="lg" disabled={busy}>Save note</Button>
        </form>
      </Sheet>

      <Sheet open={sheet === "photo"} onClose={() => setSheet(null)} title="Add photo">
        <form onSubmit={submitPhoto} className="space-y-4">
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500">
            <span className="text-3xl">📷</span>
            <span className="text-sm font-medium">{photo.file ? photo.file.name : "Tap to take or choose a photo"}</span>
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => setPhoto({ ...photo, file: e.target.files?.[0] ?? null })} />
          </label>
          <Field label="Caption (optional)">
            <Input value={photo.note} onChange={(e) => setPhoto({ ...photo, note: e.target.value })} />
          </Field>
          <Button type="submit" size="lg" disabled={busy || !photo.file}>{busy ? "Uploading…" : "Save photo"}</Button>
        </form>
      </Sheet>

      <Sheet open={sheet === "harvest"} onClose={() => setSheet(null)} title={`Harvest ${batch.code}`}>
        <form onSubmit={submitHarvest} className="space-y-4">
          <Field label="Plants harvested">
            <Input required type="number" min="1" inputMode="numeric" value={harvest.plantCount}
              onChange={(e) => setHarvest({ ...harvest, plantCount: e.target.value })} placeholder={String(batch.plantCount)} />
          </Field>
          <Field label="Wet weight (grams)">
            <Input required type="number" min="1" step="0.1" inputMode="decimal" value={harvest.wetWeightG}
              onChange={(e) => setHarvest({ ...harvest, wetWeightG: e.target.value })} placeholder="25000" />
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={harvest.notes} onChange={(e) => setHarvest({ ...harvest, notes: e.target.value })} />
          </Field>
          <p className="text-xs text-gray-400">An inventory lot is created automatically and the batch is marked harvested.</p>
          <Button type="submit" size="lg" disabled={busy}>Record harvest</Button>
        </form>
      </Sheet>

      <Sheet open={sheet === "waste"} onClose={() => setSheet(null)} title="Record destruction">
        <form onSubmit={submitWaste} className="space-y-4">
          <Field label="Reason">
            <Select value={waste.reason} onChange={(e) => setWaste({ ...waste, reason: e.target.value })}>
              {Object.entries(WASTE_REASON_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plants destroyed">
              <Input type="number" min="1" inputMode="numeric" value={waste.plantCount} onChange={(e) => setWaste({ ...waste, plantCount: e.target.value })} />
            </Field>
            <Field label="Weight (g)">
              <Input type="number" step="0.1" inputMode="decimal" value={waste.weightGrams} onChange={(e) => setWaste({ ...waste, weightGrams: e.target.value })} />
            </Field>
          </div>
          <Field label="Destruction method">
            <Input required value={waste.method} onChange={(e) => setWaste({ ...waste, method: e.target.value })} />
          </Field>
          <Field label="Witness name" hint="SAHPRA requires witnessed destruction">
            <Input required value={waste.witnessName} onChange={(e) => setWaste({ ...waste, witnessName: e.target.value })} placeholder="Full name of witness" />
          </Field>
          <Field label="Notes (optional)">
            <Textarea value={waste.notes} onChange={(e) => setWaste({ ...waste, notes: e.target.value })} />
          </Field>
          <Button type="submit" size="lg" variant="danger" disabled={busy}>Record destruction</Button>
        </form>
      </Sheet>
    </div>
  );
}
