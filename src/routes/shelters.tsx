import { createFileRoute } from "@tanstack/react-router";
import { Accessibility, HeartPulse, Phone, Users, Utensils } from "lucide-react";

import { AppShell, DemoNote, StatCard } from "@/components/suraksha/ui";
import { useSuraksha } from "@/lib/suraksha/store";

export const Route = createFileRoute("/shelters")({
  head: () => ({
    meta: [
      { title: "Shelter Management — SURAKSHA360" },
      {
        name: "description",
        content:
          "Shelter capacity, occupancy, free spaces, food and medical support plus accessibility across the district relief network.",
      },
      { property: "og:title", content: "Shelter Management — SURAKSHA360" },
      {
        property: "og:description",
        content: "Find open relief shelters with live free-space counts, food, medical support and accessibility details.",
      },
    ],
  }),
  component: SheltersPage,
});

function SheltersPage() {
  const { shelters } = useSuraksha();
  const capacity = shelters.reduce((s, x) => s + x.capacity, 0);
  const occupied = shelters.reduce((s, x) => s + x.occupied, 0);

  return (
    <AppShell
      eyebrow="Shelters"
      title="Relief shelter network"
      subtitle="Six district shelters with live space, food and medical status. Occupancy above 90% is flagged for redistribution."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Shelters open" value={shelters.length} />
        <StatCard label="Total capacity" value={capacity} tone="navy" />
        <StatCard label="Occupied" value={occupied} tone="warn" />
        <StatCard label="Free spaces" value={capacity - occupied} tone="safe" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shelters.map((s) => {
          const free = s.capacity - s.occupied;
          const pct = Math.round((s.occupied / s.capacity) * 100);
          const tight = pct >= 90;
          return (
            <article key={s.id} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-bold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.location}</p>
                </div>
                <span
                  className={
                    tight
                      ? "rounded-md bg-emergency/12 px-2 py-1 text-[11px] font-semibold text-emergency"
                      : "rounded-md bg-safe/12 px-2 py-1 text-[11px] font-semibold text-safe"
                  }
                >
                  {tight ? "Near full" : "Space available"}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${tight ? "bg-emergency" : "bg-navy"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-muted py-1.5">
                  <p className="font-display text-base font-bold">{s.capacity}</p>
                  <p className="text-muted-foreground">capacity</p>
                </div>
                <div className="rounded-md bg-muted py-1.5">
                  <p className="font-display text-base font-bold">{s.occupied}</p>
                  <p className="text-muted-foreground">occupied</p>
                </div>
                <div className="rounded-md bg-muted py-1.5">
                  <p className="font-display text-base font-bold text-safe">{free}</p>
                  <p className="text-muted-foreground">free</p>
                </div>
              </div>

              <ul className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
                <li
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
                    s.food ? "bg-safe/12 text-safe" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Utensils className="size-3.5" /> {s.food ? "Food served" : "No kitchen"}
                </li>
                <li
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
                    s.medical ? "bg-info/12 text-info" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <HeartPulse className="size-3.5" /> {s.medical ? "Medical post" : "No medical post"}
                </li>
                <li
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
                    s.accessible ? "bg-safe/12 text-safe" : "bg-caution/25 text-caution-foreground"
                  }`}
                >
                  <Accessibility className="size-3.5" /> {s.accessible ? "Wheelchair access" : "Limited access"}
                </li>
              </ul>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-3.5" /> {s.contact}
                <Users className="ml-2 size-3.5" /> {pct}% full
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-6">
        <DemoNote>Shelters and contact numbers are fictional prototype data.</DemoNote>
      </div>
    </AppShell>
  );
}
