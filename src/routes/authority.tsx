import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Package,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AppShell,
  DemoNote,
  SeverityBadge,
  StatCard,
  StatusBadge,
  TaskBadge,
  Timeline,
} from "@/components/suraksha/ui";
import { formatTime, useSuraksha } from "@/lib/suraksha/store";

export const Route = createFileRoute("/authority")({
  head: () => ({
    meta: [
      { title: "Authority Console — SURAKSHA360" },
      {
        name: "description",
        content:
          "District control room console: verify citizen reports, assign rescue teams, release relief resources and issue public alerts.",
      },
      { property: "og:title", content: "Authority Console — SURAKSHA360" },
      {
        property: "og:description",
        content: "Verify incidents, dispatch responders and track every active response in one place.",
      },
    ],
  }),
  component: AuthorityDashboard,
});

function AuthorityDashboard() {
  const {
    incidents,
    tasks,
    responders,
    resources,
    resourceAssignments,
    verifyIncident,
    rejectIncident,
    requestInfo,
    assignTask,
    assignResource,
  } = useSuraksha();

  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [responderId, setResponderId] = useState(responders[0]?.id ?? "");
  const [instructions, setInstructions] = useState("");
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? "");
  const [quantity, setQuantity] = useState("10");
  const [openIncident, setOpenIncident] = useState<string | null>(incidents[0]?.id ?? null);

  const kpis = useMemo(() => {
    const volunteers = responders.length;
    return {
      total: incidents.length,
      pending: incidents.filter((i) => i.status === "reported" || i.status === "verification").length,
      critical: incidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length,
      active: tasks.filter((t) => t.status !== "completed").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
      volunteers,
      resourceUnits: resources.reduce((s, r) => s + (r.total - r.assigned), 0),
    };
  }, [incidents, resources, responders, tasks]);

  const queue = incidents.filter((i) => i.status === "reported" || i.status === "verification");
  const verified = incidents.filter((i) => i.status === "verified");
  const detail = incidents.find((i) => i.id === openIncident);

  const doAssign = (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    const responder = responders.find((r) => r.id === responderId);
    if (!incident || !responder) return;
    assignTask({
      incidentId,
      responderId,
      title: `${incident.type} response — ${incident.location}`,
      instructions:
        instructions.trim() ||
        `Proceed to ${incident.location}. ${incident.affectedPeople} people affected. Report status every 15 minutes.`,
    });
    setInstructions("");
    setAssignFor(null);
    toast.success(`${responder.team} assigned to ${incidentId}`);
  };

  return (
    <AppShell
      eyebrow="Authority"
      title="District control room"
      subtitle="Verify what comes in, dispatch the right team, release the right stock — every change flows straight to the citizen and responder views."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total reports" value={kpis.total} icon={<ClipboardList className="size-4" />} />
        <StatCard label="Pending" value={kpis.pending} tone="warn" icon={<HelpCircle className="size-4" />} />
        <StatCard label="Critical" value={kpis.critical} tone="emergency" icon={<Activity className="size-4" />} />
        <StatCard label="Active responses" value={kpis.active} tone="info" icon={<Users className="size-4" />} />
        <StatCard label="Resolved" value={kpis.resolved} tone="safe" icon={<CheckCircle2 className="size-4" />} />
        <StatCard label="Volunteers" value={kpis.volunteers} icon={<BadgeCheck className="size-4" />} />
        <StatCard label="Resource units free" value={kpis.resourceUnits} tone="navy" icon={<Boxes className="size-4" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section>
          <h2 className="text-lg font-bold">Verification queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {queue.length} report(s) awaiting a decision. Verifying unlocks team assignment.
          </p>
          <div className="mt-3 space-y-3">
            {queue.length === 0 && (
              <p className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
                Queue clear — every report has been actioned.
              </p>
            )}
            {queue.map((incident) => (
              <article key={incident.id} className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                  <span className="ml-auto text-xs text-muted-foreground">{formatTime(incident.reportedAt)}</span>
                </div>
                <p className="mt-2 font-semibold">
                  {incident.type} · {incident.location}
                </p>
                <p className="text-sm text-muted-foreground">{incident.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {incident.affectedPeople} affected · reported by {incident.reportedBy}
                  {incident.imageName ? ` · photo: ${incident.imageName}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      verifyIncident(incident.id);
                      toast.success(`${incident.id} verified — ready for assignment`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-safe px-3 py-2 text-sm font-semibold text-safe-foreground"
                  >
                    <CheckCircle2 className="size-4" /> Verify
                  </button>
                  <button
                    onClick={() => {
                      rejectIncident(incident.id, "field check found no emergency");
                      toast("Report rejected", { description: `${incident.id} closed as unverified.` });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-semibold"
                  >
                    <XCircle className="size-4" /> Reject
                  </button>
                  <button
                    onClick={() => {
                      requestInfo(incident.id, "Please share a landmark and how many people are still stranded.");
                      toast("More information requested");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-semibold"
                  >
                    <HelpCircle className="size-4" /> Request info
                  </button>
                </div>
              </article>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-bold">Verified — assign a team</h2>
          <div className="mt-3 space-y-3">
            {verified.length === 0 && (
              <p className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
                Nothing waiting for assignment.
              </p>
            )}
            {verified.map((incident) => (
              <article key={incident.id} className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
                <p className="mt-2 font-semibold">
                  {incident.type} · {incident.location}
                </p>
                {assignFor === incident.id ? (
                  <div className="mt-3 space-y-3 rounded-lg bg-muted p-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Team</span>
                      <select
                        value={responderId}
                        onChange={(e) => setResponderId(e.target.value)}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        {responders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.team} — {r.name} {r.available ? "(available)" : "(engaged)"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Instructions</span>
                      <textarea
                        rows={2}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Deploy 2 boats from the pump house side…"
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => doAssign(incident.id)}
                        className="rounded-lg bg-emergency px-3 py-2 text-sm font-semibold text-emergency-foreground"
                      >
                        Assign task
                      </button>
                      <button onClick={() => setAssignFor(null)} className="rounded-lg border px-3 py-2 text-sm font-semibold">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAssignFor(incident.id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-navy-foreground"
                  >
                    <Users className="size-4" /> Assign task
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Release resources</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Resource</span>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.total - r.assigned} {r.unit} free
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Qty</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Incident</span>
              <select
                value={openIncident ?? ""}
                onChange={(e) => setOpenIncident(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {incidents
                  .filter((i) => i.status !== "rejected")
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id} — {i.type}, {i.location}
                    </option>
                  ))}
              </select>
            </label>
            <button
              onClick={() => {
                if (!openIncident) return;
                const ok = assignResource(resourceId, openIncident, Number(quantity) || 0);
                toast[ok ? "success" : "error"](
                  ok ? "Resources dispatched" : "Not enough stock available for that quantity",
                );
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-warn px-3 py-2 text-sm font-semibold text-warn-foreground"
            >
              <Package className="size-4" /> Dispatch to incident
            </button>
            <ul className="mt-4 space-y-2">
              {resourceAssignments.slice(0, 4).map((ra) => {
                const res = resources.find((r) => r.id === ra.resourceId);
                return (
                  <li key={ra.id} className="rounded-lg border bg-background px-3 py-2 text-xs">
                    <span className="font-semibold">{ra.quantity}</span> {res?.unit} {res?.name} →{" "}
                    <span className="font-mono">{ra.incidentId}</span> · {formatTime(ra.assignedAt)}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Active tasks</h2>
            <ul className="mt-3 space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="rounded-lg border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                    <TaskBadge status={t.status} />
                    <SeverityBadge severity={t.priority} />
                  </div>
                  <p className="mt-1 text-sm font-semibold">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.teamName} · incident <span className="font-mono">{t.incidentId}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {detail && (
            <section className="rounded-xl border bg-card p-5 shadow-card">
              <h2 className="text-lg font-bold">Incident trail — {detail.id}</h2>
              <div className="mt-3">
                <Timeline entries={detail.timeline} />
              </div>
              <div className="mt-4">
                <DemoNote>All decisions here are simulated for the prototype demo.</DemoNote>
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
