import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MapPin, Phone, Siren } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, DemoNote } from "@/components/suraksha/ui";
import { useSuraksha } from "@/lib/suraksha/store";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "SOS Mode — SURAKSHA360" },
      {
        name: "description",
        content:
          "Simulated one-tap SOS flow showing how a distress signal reaches the district control room, with your location and nearby services.",
      },
      { property: "og:title", content: "SOS Mode — SURAKSHA360" },
      {
        property: "og:description",
        content: "A demonstration SOS flow with location sharing and nearby hospitals, fire stations and shelters.",
      },
    ],
  }),
  component: SosPage,
});

const STEPS = [
  "Capturing your approximate location",
  "Signal received by Nagara District control room",
  "Nearest response team identified",
  "Simulated assistance dispatched",
];

function SosPage() {
  const { mapPins, shelters, responders } = useSuraksha();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active || step >= STEPS.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), 1200);
    return () => window.clearTimeout(t);
  }, [active, step]);

  return (
    <AppShell
      eyebrow="SOS"
      title="SOS mode"
      subtitle="One tap shows how a distress signal would travel through SURAKSHA360. This prototype does not place calls or send messages."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-xl border bg-navy p-6 text-navy-foreground shadow-raised">
          <div className="flex flex-col items-center py-6">
            <button
              onClick={() => {
                setActive(true);
                setStep(0);
              }}
              className="pulse-ring flex size-44 flex-col items-center justify-center rounded-full bg-emergency text-emergency-foreground shadow-raised transition-transform hover:scale-105 sm:size-52"
            >
              <Siren className="size-10" />
              <span className="mt-2 font-display text-3xl font-bold tracking-wider">SOS</span>
              <span className="text-[11px] uppercase tracking-[0.2em] opacity-80">tap to simulate</span>
            </button>
            <p className="mt-5 text-center text-sm text-navy-foreground/70">
              Hold your phone steady. In a real deployment this would alert the district control room with your
              live coordinates.
            </p>
          </div>

          <div className="rounded-lg bg-navy-foreground/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-emergency" /> Current location (demo)
            </p>
            <p className="mt-1 text-sm text-navy-foreground/75">
              Riverside Colony, Ward 12 · 10.0120° N, 76.2810° E · accuracy ±35 m
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Assistance flow</h2>
            {!active ? (
              <p className="mt-3 text-sm text-muted-foreground">Tap the SOS button to run the simulated flow.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {STEPS.map((s, i) => (
                  <li
                    key={s}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                      i < step ? "bg-safe/10 text-safe" : i === step ? "bg-muted" : "text-muted-foreground"
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 className="size-4" />
                    ) : i === step ? (
                      <Loader2 className="size-4 animate-spin text-emergency" />
                    ) : (
                      <span className="size-4 rounded-full border" />
                    )}
                    {s}
                  </li>
                ))}
              </ol>
            )}
            {active && step >= STEPS.length && (
              <p className="mt-3 rounded-lg bg-safe/12 px-3 py-2 text-sm font-semibold text-safe">
                Simulation complete — {responders[0]?.team} would be en route in a live deployment.
              </p>
            )}
            <div className="mt-4">
              <DemoNote>No real call, SMS or emergency dispatch is triggered by this button.</DemoNote>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Nearby services</h2>
            <ul className="mt-3 space-y-2">
              {mapPins
                .filter((p) => p.kind === "hospital" || p.kind === "fire_station")
                .map((p) => (
                  <li key={p.id} className="rounded-lg border bg-background p-3">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.detail}</p>
                  </li>
                ))}
              {shelters.slice(0, 2).map((s) => (
                <li key={s.id} className="rounded-lg border bg-background p-3">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Shelter · {s.capacity - s.occupied} spaces free
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="size-3.5" /> Demo helpline: +91 90000 00112 (not a working number)
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
