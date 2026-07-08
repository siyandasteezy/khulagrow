"use client";

import { useCallback, useEffect, useState } from "react";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader, Button, Spinner, EmptyState, Badge, Sheet, Field, Input, Select, Textarea, cn } from "@/components/ui";
import { apiGet, apiMutate } from "@/lib/offline";
import { PRIORITY_COLORS } from "@/lib/constants";
import { format, isPast } from "date-fns";

type TaskRow = {
  id: string; title: string; description: string | null; status: string;
  priority: string; dueDate: string | null;
  assignee: { id: string; name: string } | null;
  batch: { code: string } | null;
};

export default function TasksPage() {
  const { farm, loading } = useFarm();
  const [tasks, setTasks] = useState<TaskRow[] | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!farm) return;
    apiGet<TaskRow[]>(`/api/tasks?farmId=${farm.id}`).then(setTasks).catch(() => setTasks([]));
  }, [farm]);
  useEffect(load, [load]);

  if (loading || (farm && !tasks)) return <Spinner />;
  if (!farm) return <EmptyState icon="🚜" title="Add a farm first" />;

  const open = tasks!.filter((t) => ["PENDING", "IN_PROGRESS"].includes(t.status));
  const done = tasks!.filter((t) => t.status === "DONE");

  async function toggle(task: TaskRow) {
    const r = await apiMutate(`/api/tasks/${task.id}`, "PUT", {
      status: task.status === "DONE" ? "PENDING" : "DONE",
    });
    if (r.queued) setMsg("Saved offline — will sync when online");
    load();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const r = await apiMutate("/api/tasks", "POST", {
      farmId: farm!.id,
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    });
    if (r.error) { setMsg(r.error); return; }
    setSheet(false);
    setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
    if (r.queued) setMsg("Saved offline — will sync when online");
    load();
  }

  function TaskCard({ t }: { t: TaskRow }) {
    const overdue = t.dueDate && t.status !== "DONE" && isPast(new Date(t.dueDate));
    return (
      <Card className="flex items-start gap-3 p-3.5">
        <button
          onClick={() => toggle(t)}
          aria-label={t.status === "DONE" ? "Reopen task" : "Complete task"}
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
            t.status === "DONE" ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 text-transparent"
          )}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium", t.status === "DONE" ? "text-gray-400 line-through" : "text-gray-900")}>
            {t.title}
          </p>
          {t.description && <p className="mt-0.5 text-sm text-gray-500">{t.description}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge className={PRIORITY_COLORS[t.priority]}>{t.priority.toLowerCase()}</Badge>
            {t.batch && <Badge className="bg-brand-50 text-brand-800">{t.batch.code}</Badge>}
            {t.assignee && <Badge className="bg-gray-100 text-gray-600">👤 {t.assignee.name}</Badge>}
            {t.dueDate && (
              <Badge className={overdue ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}>
                {overdue ? "⚠ " : ""}due {format(new Date(t.dueDate), "d MMM")}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Tasks" action={<Button size="sm" onClick={() => setSheet(true)}>+ New task</Button>} />

      {msg && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" onClick={() => setMsg(null)}>{msg}</p>}

      {open.length === 0 ? (
        <EmptyState icon="🎉" title="All caught up" hint="No open tasks" />
      ) : (
        <div className="space-y-2.5">{open.map((t) => <TaskCard key={t.id} t={t} />)}</div>
      )}

      {done.length > 0 && (
        <div className="mt-6">
          <button onClick={() => setShowDone(!showDone)} className="mb-2 text-sm font-semibold text-gray-500">
            {showDone ? "▾" : "▸"} Completed ({done.length})
          </button>
          {showDone && <div className="space-y-2.5">{done.map((t) => <TaskCard key={t.id} t={t} />)}</div>}
        </div>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="New task">
        <form onSubmit={create} className="space-y-4">
          <Field label="Title">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Flush tunnel 2 irrigation lines" autoFocus />
          </Field>
          <Field label="Details (optional)">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </Field>
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" size="lg">Create task</Button>
        </form>
      </Sheet>
    </div>
  );
}
