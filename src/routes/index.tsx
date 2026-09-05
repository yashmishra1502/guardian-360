import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Home, Map, Radio, ShieldCheck, Siren, Users } from "lucide-react";

import { Brand, DemoNote, SeverityBadge, StatusBadge } from "@/components/suraksha/ui";
import { useSuraksha } from "@/lib/suraksha/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SURAKSHA360 — Report. Respond. Rescue." },
      {
        name: "description",
        content:
          "SURAKSHA360 is a disaster-management command prototype connecting citizen reports, authority verification, responder tasks and relief resources in one live workflow.",
      },
      { property: "og:title", content: "SURAKSHA360 — Report. Respond. Rescue." },
      {
        property: "og:description",
        content:
          "Citizen reporting, authority verification, responder dispatch, resources, shelters and live disaster map in a single emergency console.",
      },
    ],
  }),
  component: Landing,
});

const WORKFLOW = [
  { step: "Report", detail: "Citizen files an incident with severity, location and photo." },
  { step: "Verify", detail: "Control room confirms, rejects or requests more information." },
  { step: "Respond", detail: "Task assigned to the nearest rescue or medical team." },
  { step: "Rescue", detail: "Responder updates status live; resources are dispatched." },
  { step: "Resolve", detail: "Incident closed and the citizen is notified instantly." },
];

function Landing() {
  const { incidents, tasks, responders, shelters, resources } = useSuraksha();
  const active = incidents.filter((i) => ["verified", "assigned", "in_progress"].includes(i.status));
  const critical = incidents.filter((i) => i.severity === "critical" && i.status !== "resolved");
  const preview = incidents.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand />
          <div className="hidden gap-1 sm:flex">
            <Link
              to="/citizen"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-navy-foreground/80 hover:bg-navy-foreground/10"
            >
              Citizen
            </Link>
            <Link
              to="/authority"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-navy-foreground/80 hover:bg-navy-foreground/10"
            >
              Authority
            </Link>
            <Link
              to="/responder"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-navy-foreground/80 hover:bg-navy-foreground/10"
            >
              Responder
            </Link>
          </div>
        </div>

        <div className="grid-backdrop">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emergency/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emergency ring-1 ring-emergency/30">
                <Siren className="size-3.5" /> Nagara District EOC · demo mode
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                One command line from the first call for help to the last rescue.
              </h1>
              <p className="mt-4 max-w-xl text-base text-navy-foreground/75">
                SURAKSHA360 links citizens, district authorities and field responders on a single verified
                workflow — so no report is lost, no team is idle and no resource is unaccounted for.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/citizen"
                  className="pulse-ring inline-flex items-center gap-2 rounded-lg bg-emergency px-5 py-3 text-sm font-semibold text-emergency-foreground shadow-raised transition-transform hover:-translate-y-0.5"
                >
                  <AlertTriangle className="size-4" /> Report Emergency
                </Link>
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-foreground/10 px-5 py-3 text-sm font-semibold text-navy-foreground ring-1 ring-navy-foreground/25 transition-colors hover:bg-navy-foreground/20"
                >
                  <Map className="size-4" /> Live Map
                </Link>
                <Link
                  to="/shelters"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-foreground/10 px-5 py-3 text-sm font-semibold text-navy-foreground ring-1 ring-navy-foreground/25 transition-colors hover:bg-navy-foreground/20"
                >
                  <Home className="size-4" /> Find Shelter
                </Link>
              </div>

              <dl className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { k: "Live incidents", v: active.length },
                  { k: "Critical now", v: critical.length },
                  { k: "Teams on duty", v: responders.length },
                  { k: "Shelter beds", v: shelters.reduce((s, x) => s + (x.capacity - x.occupied), 0) },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-navy-foreground/55">{s.k}</dt>
                    <dd className="font-display text-2xl font-bold">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl bg-card p-4 text-card-foreground shadow-raised sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Emergency dashboard preview</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emergency">
                  <Radio className="size-3.5 animate-pulse" /> live feed
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {preview.map((incident) => (
                  <div key={incident.id} className="rounded-lg border bg-background p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                    </div>
                    <p className="mt-1.5 text-sm font-semibold">
                      {incident.type} · {incident.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {incident.affectedPeople} affected · {incident.description.slice(0, 68)}…
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "Open tasks", v: tasks.filter((t) => t.status !== "completed").length },
                  { k: "Resource lines", v: resources.length },
                  { k: "Shelters", v: shelters.length },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg bg-muted px-2 py-2">
                    <p className="font-display text-lg font-bold text-navy">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.k}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <DemoNote>Prototype data — no real dispatch, call or SMS is triggered.</DemoNote>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">The SURAKSHA360 workflow</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every action in one dashboard updates the others instantly — verification unlocks assignment,
          assignment unlocks field status, completion notifies the citizen.
        </p>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {WORKFLOW.map((item, i) => (
            <li key={item.step} className="rounded-xl border bg-card p-4 shadow-card">
              <span className="font-mono text-xs text-emergency">0{i + 1}</span>
              <p className="mt-1 font-display text-lg font-bold">{item.step}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <AlertTriangle className="size-5" />,
              title: "Citizen dashboard",
              body: "Report incidents, track the status trail and get notified the moment help closes the case.",
              to: "/citizen" as const,
            },
            {
              icon: <ShieldCheck className="size-5" />,
              title: "Authority console",
              body: "Verify reports, assign teams, release relief resources and broadcast public alerts.",
              to: "/authority" as const,
            },
            {
              icon: <Users className="size-5" />,
              title: "Responder view",
              body: "Accept tasks, follow instructions and push live ground status back to the control room.",
              to: "/responder" as const,
            },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="group rounded-xl border bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-navy text-navy-foreground">
                {card.icon}
              </span>
              <p className="mt-3 font-display text-lg font-bold">{card.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emergency">
                Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          SURAKSHA360 — hackathon prototype. Nagara District, its wards, teams, shelters and alerts are
          fictional demo data. In a real emergency, call your national emergency number.
        </div>
      </footer>
    </div>
  );
}
