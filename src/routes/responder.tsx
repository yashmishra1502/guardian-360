import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MapPin, Package, Radio, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AppShell,
  DemoNote,
  ProgressTrack,
  SeverityBadge,
  StatCard,
  TaskBadge,
  Timeline,
} from "@/components/suraksha/ui";
import { TASK_FLOW, TASK_LABEL, formatTime, useSuraksha } from "@/lib/suraksha/store";

export const Route = createFileRoute("/responder")({
  head: () => ({
    meta: [
      { title: "Responder Dashboard — SURAKSHA360" },
      {
        name: "description",
        content:
          "Field responder view: accept assigned rescue tasks, follow instructions and push live status from assigned to completed.",
      },
      { property: "og:title", content: "Responder Dashboard — SURAKSHA360" },
      {
        property: "og:description",
        content: "Accept tasks, see location, priority and allocated resources, and update ground status live.",
      },
    ],
  }),
  component: ResponderDashboard,
});

function ResponderDashboard() {
  const { tasks, responders, incidents, resources, resourceAssignments, advanceTask } = useSuraksha();
  const [teamId, setTeamId] = useState(responders[0]?.id ?? "");
  const team = responders.find((r) => r.id === teamId);

  const mine = tasks.filter((t) => t.responderId === teamId);
  const openTasks = mine.filter((t) => t.status !== "completed");
  const available = tasks.filter((t) => t.status === "assigned" && t.responderId !== teamId);

  return (
    <AppShell
      eyebrow="Responder"
      title={team ? `${team.team} — field console` : "Field console"}
      subtitle="Accept a task, move it through the ground stages, and the control room plus the reporting citizen update instantly."
      actions={
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm font-semibold shadow-card"
        >
          {responders.map((r) => (
            <option key={r.id} value={r.id}>
              {r.team}
            </option>
          ))}
        </select>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned to me" value={mine.length} tone="navy" icon={<ShieldCheck className="size-4" />} />
        <StatCard label="Open now" value={openTasks.length} tone="emergency" icon={<Radio className="size-4" />} />
        <StatCard label="Completed missions" value={team?.completedMissions ?? 0} tone="safe" />
        <StatCard label="Availability" value={team?.available ? "Available" : "Engaged"} tone="info" hint={team?.baseStation} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="text-lg font-bold">My tasks</h2>
          <div className="mt-3 space-y-4">
            {mine.length === 0 && (
              <p className="rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
                No tasks for this team yet — the control room will dispatch one when an incident is verified.
              </p>
            )}
            {mine.map((task) => {
              const incident = incidents.find((i) => i.id === task.incidentId);
              const next = TASK_FLOW[TASK_FLOW.indexOf(task.status) + 1];
              const allocated = resourceAssignments.filter((ra) => ra.incidentId === task.incidentId);
              return (
                <article key={task.id} className="rounded-xl border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{task.id}</span>
                    <TaskBadge status={task.status} />
                    <SeverityBadge severity={task.priority} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      assigned {formatTime(task.assignedAt)}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold">{task.title}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 text-emergency" /> {task.location}
                    {incident ? ` · incident ${incident.id}` : ""}
                  </p>
                  <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm">{task.instructions}</p>

                  <div className="mt-3">
                    <ProgressTrack steps={TASK_FLOW} current={task.status} labels={TASK_LABEL} />
                  </div>

                  {allocated.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {allocated.map((ra) => {
                        const res = resources.find((r) => r.id === ra.resourceId);
                        return (
                          <li
                            key={ra.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-info/12 px-2 py-1 text-xs font-medium text-info"
                          >
                            <Package className="size-3.5" /> {ra.quantity} {res?.unit} {res?.name}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {next ? (
                    <button
                      onClick={() => {
                        advanceTask(task.id);
                        toast.success(`${task.id} → ${TASK_LABEL[next]}`, {
                          description:
                            next === "completed"
                              ? "Incident marked resolved and the citizen has been notified."
                              : "Control room updated.",
                        });
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emergency px-4 py-2 text-sm font-semibold text-emergency-foreground"
                    >
                      Mark {TASK_LABEL[next]} <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <p className="mt-4 rounded-lg bg-safe/12 px-3 py-2 text-sm font-semibold text-safe">
                      Task completed — incident resolved and citizen notified.
                    </p>
                  )}

                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                      Ground log
                    </summary>
                    <div className="mt-3">
                      <Timeline entries={task.timeline} />
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Available tasks (other teams)</h2>
            <ul className="mt-3 space-y-2">
              {available.length === 0 && (
                <li className="text-sm text-muted-foreground">No unaccepted tasks in the district right now.</li>
              )}
              {available.map((t) => (
                <li key={t.id} className="rounded-lg border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                    <SeverityBadge severity={t.priority} />
                  </div>
                  <p className="mt-1 text-sm font-semibold">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.teamName} · {t.location}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Team roster</h2>
            <ul className="mt-3 space-y-2">
              {responders.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                  <div>
                    <p className="text-sm font-semibold">{r.team}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.name} · {r.specialisation}
                    </p>
                  </div>
                  <span
                    className={
                      r.available
                        ? "rounded-md bg-safe/12 px-2 py-1 text-xs font-semibold text-safe"
                        : "rounded-md bg-emergency/12 px-2 py-1 text-xs font-semibold text-emergency"
                    }
                  >
                    {r.available ? "Available" : "Engaged"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <DemoNote>Demo teams and phone numbers — no real dispatch is sent.</DemoNote>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
