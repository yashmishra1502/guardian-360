import { Link, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  INCIDENT_LABEL,
  SEVERITY_LABEL,
  TASK_LABEL,
  formatTime,
} from "@/lib/suraksha/store";
import { useSurakshaAuth } from "@/lib/suraksha/auth";
import type { IncidentStatus, Severity, TaskStatus, TimelineEntry } from "@/lib/suraksha/types";

// The three "role" dashboards should never cross-link each other in the nav —
// each is its own separate console. Shared/public pages (Resources, Live Map,
// Shelters, Alerts, Prepare, SOS) still show everywhere.
const ROLE_PATHS = ["/citizen", "/authority", "/responder"] as const;

export const NAV_LINKS = [
  { to: "/citizen", label: "Citizen" },
  { to: "/authority", label: "Authority" },
  { to: "/responder", label: "Responder" },
  { to: "/resources", label: "Resources" },
  { to: "/map", label: "Live Map" },
  { to: "/shelters", label: "Shelters" },
  { to: "/alerts", label: "Alerts" },
  { to: "/preparedness", label: "Prepare" },
  { to: "/sos", label: "SOS" },
] as const;

// Role-based nav filtering: when an authority user is signed in, hide the
// Citizen and Responder dashboard links so their navbar only shows their
// own console (plus the shared/public pages).
function useVisibleNavLinks() {
  const { user } = useSurakshaAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const currentRolePath = ROLE_PATHS.find((p) => pathname.startsWith(p));

  return NAV_LINKS.filter((link) => {
    // Hide the other two role dashboards while you're on a role dashboard —
    // each console stays its own separate page.
    if (currentRolePath && ROLE_PATHS.includes(link.to as (typeof ROLE_PATHS)[number]) && link.to !== currentRolePath) {
      return false;
    }
    // On top of that, a signed-in authority never sees the Citizen/Responder
    // links even from shared pages like Resources or the Live Map.
    if (user?.role === "authority" && (link.to === "/citizen" || link.to === "/responder")) {
      return false;
    }
    return true;
  });
}

export function Brand({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          tone === "dark" ? "bg-emergency text-emergency-foreground" : "bg-navy text-navy-foreground",
        )}
      >
        <ShieldCheck className="size-5" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-lg font-bold tracking-tight",
            tone === "dark" ? "text-navy-foreground" : "text-foreground",
          )}
        >
          SURAKSHA<span className="text-emergency">360</span>
        </span>
        <span
          className={cn(
            "block text-[10px] font-medium uppercase tracking-[0.18em]",
            tone === "dark" ? "text-navy-foreground/60" : "text-muted-foreground",
          )}
        >
          Report. Respond. Rescue.
        </span>
      </span>
    </Link>
  );
}

export function AppShell({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  eyebrow?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const visibleLinks = useVisibleNavLinks();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-navy text-navy-foreground shadow-raised">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-0.5 lg:flex">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeProps={{ className: "bg-navy-foreground/15 text-navy-foreground" }}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-navy-foreground/75 transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="rounded-md p-2 text-navy-foreground/80 hover:bg-navy-foreground/10 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
        {open && (
          <nav className="grid grid-cols-2 gap-1 border-t border-navy-foreground/15 px-4 pb-3 pt-2 sm:grid-cols-3 lg:hidden">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-navy-foreground/15" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-navy-foreground/80"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emergency">{eyebrow}</p>
            )}
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </div>

      <footer className="mt-10 border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          SURAKSHA360 — hackathon prototype for Nagara District (fictional). All incidents, teams, alerts and
          contact numbers are demo data. No real emergency call, SMS or dispatch is made from this app.
        </div>
      </footer>
    </div>
  );
}

const severityTone: Record<Severity, string> = {
  critical: "bg-emergency/12 text-emergency ring-emergency/30",
  high: "bg-warn/15 text-warn-foreground ring-warn/40",
  medium: "bg-caution/25 text-caution-foreground ring-caution/50",
  low: "bg-safe/15 text-safe ring-safe/30",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
        severityTone[severity],
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

const incidentTone: Record<IncidentStatus, string> = {
  reported: "bg-muted text-muted-foreground ring-border",
  verification: "bg-caution/25 text-caution-foreground ring-caution/50",
  verified: "bg-info/12 text-info ring-info/30",
  assigned: "bg-warn/15 text-warn-foreground ring-warn/40",
  in_progress: "bg-emergency/12 text-emergency ring-emergency/30",
  resolved: "bg-safe/15 text-safe ring-safe/30",
  rejected: "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        incidentTone[status],
      )}
    >
      {INCIDENT_LABEL[status]}
    </span>
  );
}

const taskTone: Record<TaskStatus, string> = {
  assigned: "bg-muted text-muted-foreground ring-border",
  accepted: "bg-info/12 text-info ring-info/30",
  on_the_way: "bg-caution/25 text-caution-foreground ring-caution/50",
  arrived: "bg-warn/15 text-warn-foreground ring-warn/40",
  in_progress: "bg-emergency/12 text-emergency ring-emergency/30",
  completed: "bg-safe/15 text-safe ring-safe/30",
};

export function TaskBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        taskTone[status],
      )}
    >
      {TASK_LABEL[status]}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "navy",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string | undefined;
  tone?: "navy" | "emergency" | "warn" | "safe" | "info";
  icon?: ReactNode | undefined;
}) {
  const tones = {
    navy: "text-navy",
    emergency: "text-emergency",
    warn: "text-warn-foreground",
    safe: "text-safe",
    info: "text-info",
  } as const;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {icon && <span className={tones[tone]}>{icon}</span>}
      </div>
      <p className={cn("mt-2 font-display text-3xl font-bold", tones[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProgressTrack({
  steps,
  current,
  labels,
}: {
  steps: string[];
  current: string;
  labels: Record<string, string>;
}) {
  const index = steps.indexOf(current);
  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {steps.map((step, i) => {
        const done = index >= 0 && i <= index;
        return (
          <li key={step} className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold",
                done ? "bg-navy text-navy-foreground" : "bg-muted text-muted-foreground",
                i === index && "bg-emergency text-emergency-foreground",
              )}
            >
              {labels[step]}
            </span>
            {i < steps.length - 1 && <span className="text-muted-foreground/50">→</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="space-y-3 border-l pl-4">
      {entries.map((entry, i) => (
        <li key={`${entry.status}-${i}`} className="relative">
          <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-emergency ring-4 ring-card" />
          <p className="text-sm font-medium">{entry.label}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(entry.at)} · {entry.by}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-emergency/40 bg-emergency/5 px-3 py-2 text-xs text-emergency">
      {children}
    </p>
  );
}
