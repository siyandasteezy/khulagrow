"use client";

import { useCallback, useEffect, useState } from "react";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Spinner, EmptyState, Badge, Sheet, Field, Input, Select, Button } from "@/components/ui";
import { apiGet } from "@/lib/offline";
import { DOC_TYPE_LABELS } from "@/lib/constants";
import { format, isPast, addDays } from "date-fns";

type Doc = { id: string; type: string; title: string; fileUrl: string | null; expiryDate: string | null; notes: string | null; createdAt: string };

export default function DocumentsPage() {
  const { farm, loading } = useFarm();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [sheet, setSheet] = useState(false);
  const [form, setForm] = useState({ type: "LICENCE", title: "", expiryDate: "", file: null as File | null });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!farm) return;
    apiGet<Doc[]>(`/api/documents?farmId=${farm.id}`).then(setDocs).catch(() => setDocs([]));
  }, [farm]);
  useEffect(load, [load]);

  if (loading || (farm && !docs)) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      let fileUrl: string | undefined;
      if (form.file) {
        const fd = new FormData();
        fd.append("file", form.file);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await up.json();
        if (!up.ok) { setMsg(upData.error); setBusy(false); return; }
        fileUrl = upData.url;
      }
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: farm!.id,
          type: form.type,
          title: form.title,
          fileUrl,
          expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error); return; }
      setSheet(false);
      setForm({ type: "LICENCE", title: "", expiryDate: "", file: null });
      load();
    } catch {
      setMsg("Document uploads need a connection — try again when online");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Documents" subtitle="Licences, SOPs, certificates"
        action={<Button size="sm" onClick={() => setSheet(true)}>+ Upload</Button>} />

      {msg && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" onClick={() => setMsg(null)}>{msg}</p>}

      {docs!.length === 0 ? (
        <EmptyState icon="📄" title="No documents" hint="Upload your SAHPRA licence, SOPs and certificates" />
      ) : (
        <div className="space-y-2.5">
          {docs!.map((d) => {
            const expired = d.expiryDate && isPast(new Date(d.expiryDate));
            const expiringSoon = d.expiryDate && !expired && isPast(addDays(new Date(d.expiryDate), -60));
            return (
              <Card key={d.id} className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{d.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Added {format(new Date(d.createdAt), "d MMM yyyy")}
                      {d.expiryDate && ` · expires ${format(new Date(d.expiryDate), "d MMM yyyy")}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-brand-50 text-brand-800">{DOC_TYPE_LABELS[d.type]}</Badge>
                    {expired && <Badge className="bg-red-100 text-red-800">Expired</Badge>}
                    {expiringSoon && <Badge className="bg-amber-100 text-amber-800">Expiring soon</Badge>}
                  </div>
                </div>
                {d.fileUrl && (
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-700">
                    View file →
                  </a>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Upload document">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(DOC_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Title">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="SAHPRA Cultivation Licence 2026" />
          </Field>
          <Field label="Expiry date (optional)">
            <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </Field>
          <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-gray-300 text-sm text-gray-500">
            {form.file ? form.file.name : "📎 Attach PDF or image (optional)"}
            <input type="file" accept="application/pdf,image/*" className="hidden"
              onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
          </label>
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Uploading…" : "Save document"}</Button>
        </form>
      </Sheet>
    </div>
  );
}
