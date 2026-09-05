import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCircle2, Home, ImagePlus, MapPin, Send, Siren } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AppShell,
  DemoNote,
  ProgressTrack,
  SeverityBadge,
  StatCard,
  StatusBadge,
  Timeline,
} from "@/components/suraksha/ui";
import { INCIDENT_FLOW, INCIDENT_LABEL, formatTime, useSuraksha } from "@/lib/suraksha/store";
import type { DisasterType, Severity } from "@/lib/suraksha/types";

export const Route = createFileRoute("/citizen")({
  head: () => ({
    meta: [
      { title: "Citizen Dashboard — SURAKSHA360" },
      {
        name: "description",
        content:
          "Report an emergency, follow your incident ID through verification and rescue, and see nearby alerts, incidents and shelters.",
      },
      { property: "og:title", content: "Citizen Dashboard — SURAKSHA360" },
      {
        property: "og:description",
        content: "File a disaster report, track its live status and find the nearest shelter.",
      },
    ],
  }),
  component: CitizenDashboard,
});

const TYPES: DisasterType[] = [
  "Flood",
  "Fire",
  "Earthquake",
  "Cyclone",
  "Landslide",
  "Heatwave",
  "Building Collapse",
  "Industrial Accident",
];
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

function CitizenDashboard() {
  const {
    incidents,
    alerts,
    shelters,
    notifications,
    reportIncident,
    lastReportedId,
    markNotificationsRead,
  } = useSuraksha();

  const [type, setType] = useState<DisasterType>("Flood");
  const [severity, setSeverity] = useState<Severity>("high");
  const [location, setLocation] = useState("Riverside Colony, Ward 12");
  const [description, setDescription] = useState("");
  const [affected, setAffected] = useState("1");
  const [imageName, setImageName] = useState("");
  const [trackedId, setTrackedId] = useState<string | null>(null);

  const myIncidents = useMemo(
    () => incidents.filter((i) => i.reportedById === "USR-001"),
    [incidents],
  );
  const tracked = useMemo(
    () => incidents.find((i) => i.id === (trackedId ?? lastReportedId ?? myIncidents[0]?.id)),
    [incidents, lastReportedId, myIncidents, trackedId],
  );
  const unread = notifications.filter((n) => !n.read).length;
  const riskLevel = incidents.some((i) => i.severity === "critical" && i.status !== "resolved")
    ? "Critical"
    : "Elevated";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      toast.error("Add a location and a short description.");
      return;
    }
    const incident = reportIncident({
      type,
      severity,
      location,
      description,
      affectedPeople: Number(affected) || 1,
      imageName: imageName || undefined,
    });
    setTrackedId(incident.id);
    setDescription("");
    setImageName("");
    toast.success(`Report filed — ${incident.id}`, {
      description: "The district control room has received it for verification.",
    });
  };

  return (
    <AppShell
      eyebrow="Citizen"
      title="Your safety dashboard"
      subtitle="Report what you see, follow it through verification and rescue, and keep the nearest shelter one tap away."
      actions={
        <>
          <button
            type="button"
            onClick={markNotificationsRead}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-semibold shadow-card"
          >
            <Bell className="size-4" /> Notifications
            {unread > 0 && (
              <span className="rounded-full bg-emergency px-1.5 text-[11px] text-emergency-foreground">
                {unread}
              </span>
            )}
          </button>
          <Link
            to="/sos"
            className="inline-flex items-center gap-2 rounded-lg bg-emergency px-3 py-2 text-sm font-semibold text-emergency-foreground shadow-card"
          >
            <Siren className="size-4" /> SOS
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="District risk level" value={riskLevel} tone="emergency" hint="Based on open critical incidents" />
        <StatCard label="Active alerts" value={alerts.length} tone="warn" hint="Issued by district EOC" />
        <StatCard label="Nearby incidents" value={incidents.filter((i) => i.status !== "resolved").length} tone="navy" />
        <StatCard
          label="Shelter beds free"
          value={shelters.reduce((s, x) => s + (x.capacity - x.occupied), 0)}
          tone="safe"
          hint={`${shelters.length} shelters open`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Report an incident</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You will get an incident ID immediately, e.g. INC-2026-1042.
          </p>

          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Disaster type
                </span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as DisasterType)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Severity
                </span>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Location
              </span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3">
                <MapPin className="size-4 text-emergency" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Street, landmark, ward"
                  className="w-full bg-transparent py-2 text-sm outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What is happening?
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Water entered ground floor, four families stranded on the terrace…"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  People affected
                </span>
                <input
                  type="number"
                  min={0}
                  value={affected}
                  onChange={(e) => setAffected(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Photo (optional)
                </span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-dashed bg-background px-3 py-2 text-sm text-muted-foreground">
                  <ImagePlus className="size-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageName(e.target.files?.[0]?.name ?? "")}
                    className="w-full text-xs"
                  />
                </div>
                {imageName && <span className="mt-1 block text-xs text-safe">Attached: {imageName}</span>}
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emergency px-4 py-3 text-sm font-semibold text-emergency-foreground shadow-card transition-transform hover:-translate-y-0.5"
            >
              <Send className="size-4" /> Submit emergency report
            </button>
            <DemoNote>Prototype: reports stay inside this demo and reach no real agency.</DemoNote>
          </form>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Track your report</h2>
              <select
                value={tracked?.id ?? ""}
                onChange={(e) => setTrackedId(e.target.value)}
                className="rounded-lg border bg-background px-2 py-1.5 text-xs"
              >
                {myIncidents.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} — {i.type}
                  </option>
                ))}
              </select>
            </div>

            {tracked ? (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{tracked.id}</span>
                  <SeverityBadge severity={tracked.severity} />
                  <StatusBadge status={tracked.status} />
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {tracked.type} · {tracked.location}
                </p>
                <p className="text-sm text-muted-foreground">{tracked.description}</p>
                <div className="mt-4">
                  <ProgressTrack steps={INCIDENT_FLOW} current={tracked.status} labels={INCIDENT_LABEL} />
                </div>
                {tracked.infoRequested && (
                  <p className="mt-3 rounded-lg bg-caution/20 px-3 py-2 text-xs text-caution-foreground">
                    Control room asked: {tracked.infoRequested}
                  </p>
                )}
                {tracked.status === "resolved" && (
                  <p className="mt-3 flex items-center gap-2 rounded-lg bg-safe/12 px-3 py-2 text-sm font-semibold text-safe">
                    <CheckCircle2 className="size-4" /> Resolved — response team has closed this incident.
                  </p>
                )}
                <div className="mt-4">
                  <Timeline entries={tracked.timeline} />
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No reports filed yet.</p>
            )}
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Notifications</h2>
            <ul className="mt-3 space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="rounded-lg border bg-background p-3">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatTime(n.at)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Current alerts near you</h2>
          <ul className="mt-3 space-y-2">
            {alerts.slice(0, 3).map((a) => (
              <li key={a.id} className="rounded-lg border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={a.severity} />
                  <span className="text-[11px] text-muted-foreground">{a.area}</span>
                </div>
                <p className="mt-1 text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.action}</p>
              </li>
            ))}
          </ul>
          <Link to="/alerts" className="mt-3 inline-block text-sm font-semibold text-emergency">
            All alerts →
          </Link>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Nearest shelters</h2>
          <ul className="mt-3 space-y-2">
            {shelters.slice(0, 3).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.location}</p>
                </div>
                <span className="whitespace-nowrap rounded-md bg-safe/12 px-2 py-1 text-xs font-semibold text-safe">
                  {s.capacity - s.occupied} free
                </span>
              </li>
            ))}
          </ul>
          <Link to="/shelters" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emergency">
            <Home className="size-4" /> Find shelter →
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
