import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell, DemoNote, SeverityBadge, StatusBadge } from "@/components/suraksha/ui";
import { useSuraksha } from "@/lib/suraksha/store";
import type { Severity } from "@/lib/suraksha/types";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Disaster Map — SURAKSHA360" },
      {
        name: "description",
        content:
          "District situation map with demo markers for critical, high and medium incidents plus shelters, hospitals, fire stations and blocked roads.",
      },
      { property: "og:title", content: "Live Disaster Map — SURAKSHA360" },
      {
        property: "og:description",
        content: "See incidents, shelters, hospitals, fire stations and blocked roads across the district at a glance.",
      },
    ],
  }),
  component: MapPage,
});

// Simple linear projection of the fictional district bounds onto the panel.
const project = (lat: number, lng: number) => ({
  left: `${Math.min(96, Math.max(4, ((lng - 76.24) / 0.12) * 100))}%`,
  top: `${Math.min(94, Math.max(6, ((10.06 - lat) / 0.12) * 100))}%`,
});

const dot: Record<Severity, string> = {
  critical: "bg-emergency",
  high: "bg-warn",
  medium: "bg-caution",
  low: "bg-safe",
};

const pinStyle = {
  hospital: { label: "H", cls: "bg-info text-info-foreground" },
  fire_station: { label: "F", cls: "bg-navy text-navy-foreground" },
  blocked_road: { label: "✕", cls: "bg-foreground text-background" },
  shelter: { label: "S", cls: "bg-safe text-safe-foreground" },
} as const;

function MapPage() {
  const { incidents, shelters, mapPins } = useSuraksha();
  const [selected, setSelected] = useState<string | null>(null);
  const open = incidents.filter((i) => i.status !== "rejected");
  const active = open.find((i) => i.id === selected);

  return (
    <AppShell
      eyebrow="Live map"
      title="District situation map"
      subtitle="A schematic view of Nagara District. Markers move as incidents are verified, assigned and resolved."
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-emergency" /> Critical
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-warn" /> High
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-caution" /> Medium
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-safe" /> Safe / low
            </span>
            <span className="ml-auto text-muted-foreground">H hospital · F fire station · S shelter · ✕ blocked road</span>
          </div>

          <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-navy grid-backdrop">
            <div className="absolute inset-x-0 top-[52%] h-6 -rotate-6 bg-info/25" aria-hidden />
            <div className="absolute inset-y-0 left-[38%] w-4 bg-navy-foreground/10" aria-hidden />
            <div className="absolute left-[10%] top-[12%] size-28 rounded-full bg-safe/15" aria-hidden />

            {open.map((incident) => (
              <button
                key={incident.id}
                onClick={() => setSelected(incident.id)}
                style={project(incident.lat, incident.lng)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                aria-label={`${incident.type} at ${incident.location}`}
              >
                <span
                  className={`block size-4 rounded-full ring-2 ring-navy-foreground/70 ${dot[incident.severity]} ${
                    incident.severity === "critical" ? "pulse-ring" : ""
                  }`}
                />
              </button>
            ))}

            {shelters.map((s) => (
              <span
                key={s.id}
                style={project(s.lat, s.lng)}
                title={s.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-safe px-1.5 py-0.5 text-[10px] font-bold text-safe-foreground"
              >
                S
              </span>
            ))}

            {mapPins.map((p) => (
              <span
                key={p.id}
                style={project(p.lat, p.lng)}
                title={`${p.name} — ${p.detail}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  pinStyle[p.kind].cls
                }`}
              >
                {pinStyle[p.kind].label}
              </span>
            ))}

            <span className="absolute bottom-2 right-3 text-[10px] uppercase tracking-widest text-navy-foreground/50">
              Schematic demo map — not to scale
            </span>
          </div>

          {active && (
            <div className="mt-3 rounded-lg border bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{active.id}</span>
                <SeverityBadge severity={active.severity} />
                <StatusBadge status={active.status} />
              </div>
              <p className="mt-1 text-sm font-semibold">
                {active.type} · {active.location}
              </p>
              <p className="text-xs text-muted-foreground">{active.description}</p>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Incidents on map</h2>
            <ul className="mt-3 space-y-2">
              {open.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => setSelected(i.id)}
                    className="w-full rounded-lg border bg-background p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`size-2.5 rounded-full ${dot[i.severity]}`} />
                      <span className="font-mono text-[11px] text-muted-foreground">{i.id}</span>
                      <StatusBadge status={i.status} />
                    </div>
                    <p className="mt-1 text-sm font-semibold">
                      {i.type} · {i.location}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Facilities & closures</h2>
            <ul className="mt-3 space-y-2">
              {mapPins.map((p) => (
                <li key={p.id} className="rounded-lg border bg-background p-3">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.detail}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <DemoNote>Positions are illustrative demo coordinates, not live GPS.</DemoNote>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
