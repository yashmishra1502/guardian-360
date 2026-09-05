import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, DemoNote, SeverityBadge, StatCard } from "@/components/suraksha/ui";
import { formatTime, useSuraksha } from "@/lib/suraksha/store";
import type { Severity } from "@/lib/suraksha/types";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Emergency Alerts — SURAKSHA360" },
      {
        name: "description",
        content:
          "District emergency alerts with severity, affected area, issue time and the recommended action for residents.",
      },
      { property: "og:title", content: "Emergency Alerts — SURAKSHA360" },
      {
        property: "og:description",
        content: "Broadcast and review district-wide emergency alerts with clear recommended actions.",
      },
    ],
  }),
  component: AlertsPage,
});

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

function AlertsPage() {
  const { alerts, createAlert } = useSuraksha();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Severity>("high");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !area.trim() || !message.trim()) {
      toast.error("Title, area and message are required.");
      return;
    }
    createAlert({
      title,
      severity,
      area,
      message,
      action: action.trim() || "Follow instructions from the nearest ward officer.",
    });
    setTitle("");
    setArea("");
    setMessage("");
    setAction("");
    toast.success("Demo alert published to the district feed");
  };

  return (
    <AppShell
      eyebrow="Alerts"
      title="Emergency alert broadcast"
      subtitle="Authority-issued alerts appear on the citizen dashboard instantly. Every alert here is labelled as a prototype demo."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live alerts" value={alerts.length} tone="warn" icon={<Megaphone className="size-4" />} />
        <StatCard
          label="Critical"
          value={alerts.filter((a) => a.severity === "critical").length}
          tone="emergency"
          icon={<ShieldAlert className="size-4" />}
        />
        <StatCard label="High" value={alerts.filter((a) => a.severity === "high").length} tone="warn" />
        <StatCard label="Advisories" value={alerts.filter((a) => a.severity === "medium" || a.severity === "low").length} tone="info" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Create an alert</h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Alert headline"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Affected area"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What is happening and what to expect…"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Recommended action for residents"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emergency px-4 py-3 text-sm font-semibold text-emergency-foreground"
            >
              <Megaphone className="size-4" /> Publish demo alert
            </button>
            <DemoNote>Prototype broadcast only — nothing is sent by SMS, push or radio.</DemoNote>
          </form>
        </section>

        <section className="space-y-3">
          {alerts.map((a) => (
            <article key={a.id} className="rounded-xl border-l-4 border-l-emergency bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={a.severity} />
                <span className="font-mono text-[11px] text-muted-foreground">{a.id}</span>
                {a.demo && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Demo / prototype alert
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{formatTime(a.issuedAt)}</span>
              </div>
              <p className="mt-2 font-display text-lg font-bold">{a.title}</p>
              <p className="text-xs font-medium text-muted-foreground">{a.area}</p>
              <p className="mt-2 text-sm">{a.message}</p>
              <p className="mt-2 rounded-lg bg-warn/12 px-3 py-2 text-sm font-medium text-warn-foreground">
                Recommended action: {a.action}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">Issued by {a.issuedBy}</p>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
