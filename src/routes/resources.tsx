import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Droplets, HeartPulse, Package, Truck, Utensils, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, DemoNote, StatCard } from "@/components/suraksha/ui";
import { formatTime, useSuraksha } from "@/lib/suraksha/store";
import type { ResourceCategory } from "@/lib/suraksha/types";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Management — SURAKSHA360" },
      {
        name: "description",
        content:
          "Track food, water, medicines, blankets, ambulances and rescue equipment, and assign available stock to active incidents.",
      },
      { property: "og:title", content: "Resource Management — SURAKSHA360" },
      {
        property: "og:description",
        content: "Available vs assigned relief stock across district depots, with one-tap dispatch to incidents.",
      },
    ],
  }),
  component: ResourcesPage,
});

const ICONS: Record<ResourceCategory, React.ReactNode> = {
  Food: <Utensils className="size-4" />,
  Water: <Droplets className="size-4" />,
  Medicines: <HeartPulse className="size-4" />,
  Blankets: <Boxes className="size-4" />,
  Ambulances: <Truck className="size-4" />,
  "Rescue Equipment": <Wrench className="size-4" />,
};

function ResourcesPage() {
  const { resources, resourceAssignments, incidents, assignResource } = useSuraksha();
  const [target, setTarget] = useState<Record<string, string>>({});
  const [incidentId, setIncidentId] = useState(incidents[0]?.id ?? "");

  const totals = resources.reduce(
    (acc, r) => ({ total: acc.total + r.total, assigned: acc.assigned + r.assigned }),
    { total: 0, assigned: 0 },
  );

  return (
    <AppShell
      eyebrow="Resources"
      title="Relief resource control"
      subtitle="Every dispatch here reduces available stock and shows up in the responder's task card for that incident."
      actions={
        <select
          value={incidentId}
          onChange={(e) => setIncidentId(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm font-semibold shadow-card"
        >
          {incidents
            .filter((i) => i.status !== "rejected")
            .map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} — {i.type}
              </option>
            ))}
        </select>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Resource lines" value={resources.length} />
        <StatCard label="Total units" value={totals.total} tone="navy" />
        <StatCard label="Assigned" value={totals.assigned} tone="warn" />
        <StatCard label="Available" value={totals.total - totals.assigned} tone="safe" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((r) => {
          const free = r.total - r.assigned;
          const pct = Math.round((r.assigned / r.total) * 100);
          return (
            <article key={r.id} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-md bg-navy px-2 py-1 text-[11px] font-semibold text-navy-foreground">
                  {ICONS[r.category]} {r.category}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
              </div>
              <p className="mt-2 font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.depot}</p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-warn" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="font-semibold text-safe">
                  {free} {r.unit} available
                </span>
                <span className="text-muted-foreground">
                  {r.assigned} assigned · {r.total} total
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={target[r.id] ?? ""}
                  onChange={(e) => setTarget((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  className="w-24 rounded-lg border bg-background px-2 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    const qty = Number(target[r.id]) || 0;
                    const ok = assignResource(r.id, incidentId, qty);
                    toast[ok ? "success" : "error"](
                      ok ? `${qty} ${r.unit} sent to ${incidentId}` : "Enter a quantity within available stock",
                    );
                    if (ok) setTarget((prev) => ({ ...prev, [r.id]: "" }));
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emergency px-3 py-2 text-sm font-semibold text-emergency-foreground"
                >
                  <Package className="size-4" /> Assign
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-8 rounded-xl border bg-card p-5 shadow-card">
        <h2 className="text-lg font-bold">Assignment ledger</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Resource</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Incident</th>
                <th className="py-2 pr-4">By</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {resourceAssignments.map((ra) => {
                const res = resources.find((r) => r.id === ra.resourceId);
                return (
                  <tr key={ra.id} className="border-t">
                    <td className="py-2 pr-4 font-medium">{res?.name}</td>
                    <td className="py-2 pr-4">
                      {ra.quantity} {res?.unit}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{ra.incidentId}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{ra.assignedBy}</td>
                    <td className="py-2 text-muted-foreground">{formatTime(ra.assignedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <DemoNote>Stock figures are fictional depot data for the prototype.</DemoNote>
        </div>
      </section>
    </AppShell>
  );
}
