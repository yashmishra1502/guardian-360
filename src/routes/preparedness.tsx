import { createFileRoute } from "@tanstack/react-router";

import { AppShell, DemoNote } from "@/components/suraksha/ui";

export const Route = createFileRoute("/preparedness")({
  head: () => ({
    meta: [
      { title: "Preparedness Center — SURAKSHA360" },
      {
        name: "description",
        content:
          "Before, during and after safety guides for flood, fire, earthquake, cyclone, landslide and heatwave emergencies.",
      },
      { property: "og:title", content: "Preparedness Center — SURAKSHA360" },
      {
        property: "og:description",
        content: "Short, practical before/during/after checklists for six common disaster types.",
      },
    ],
  }),
  component: PreparednessPage,
});

const GUIDES = [
  {
    hazard: "Flood",
    before: "Keep documents in a waterproof pouch, note the nearest shelter, charge power banks.",
    during: "Move to higher floors, switch off mains, never walk or drive through moving water.",
    after: "Boil drinking water, avoid sagging wires, photograph damage before cleaning.",
  },
  {
    hazard: "Fire",
    before: "Check extinguishers, keep exits clear, agree on a family meeting point.",
    during: "Stay low under smoke, close doors behind you, never use lifts.",
    after: "Do not re-enter until cleared, ventilate rooms, treat burns with cool water only.",
  },
  {
    hazard: "Earthquake",
    before: "Anchor cupboards and heaters, keep a torch and shoes beside the bed.",
    during: "Drop, cover and hold under sturdy furniture; if outdoors, move away from walls.",
    after: "Expect aftershocks, shut off gas, check on neighbours who need help moving.",
  },
  {
    hazard: "Cyclone",
    before: "Trim loose branches, secure roofing sheets, stock 3 days of water and dry food.",
    during: "Stay in the innermost room away from windows; do not step out during the lull.",
    after: "Avoid fallen lines and flooded roads, listen for the official all-clear.",
  },
  {
    hazard: "Landslide",
    before: "Watch for new cracks, tilting trees or muddy spring water on slopes.",
    during: "Move perpendicular to the slide path, curl up and protect your head if trapped.",
    after: "Stay off the debris, report blocked roads, check upslope for further movement.",
  },
  {
    hazard: "Heatwave",
    before: "Plan outdoor work before 11:00, keep ORS at home, cover windows facing the sun.",
    during: "Drink water every 30 minutes, wear light cotton, rest in shade or a cooling centre.",
    after: "Watch for cramps, dizziness or dark urine; seek medical help for confusion or fainting.",
  },
];

function PreparednessPage() {
  return (
    <AppShell
      eyebrow="Preparedness"
      title="Preparedness center"
      subtitle="Short, practical checklists for the six hazards most common in the district."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GUIDES.map((g) => (
          <article key={g.hazard} className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="font-display text-xl font-bold">{g.hazard}</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="rounded-lg bg-info/10 p-3">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-info">Before</dt>
                <dd className="mt-1">{g.before}</dd>
              </div>
              <div className="rounded-lg bg-emergency/10 p-3">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-emergency">During</dt>
                <dd className="mt-1">{g.during}</dd>
              </div>
              <div className="rounded-lg bg-safe/10 p-3">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-safe">After</dt>
                <dd className="mt-1">{g.after}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <DemoNote>
          General guidance for a prototype demo — always follow instructions from your local disaster authority.
        </DemoNote>
      </div>
    </AppShell>
  );
}
