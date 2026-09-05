import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type {
  Alert,
  DisasterType,
  Incident,
  IncidentStatus,
  Resource,
  ResourceAssignment,
  Severity,
  Task,
  TaskStatus,
} from "./types";

/**
 * Single in-memory store shared by every dashboard.
 * No mock/seed data — everything starts empty and is populated only by
 * real actions taken in the app (citizen reports, authority decisions, etc).
 * Swapping this for Firebase/Supabase later means replacing the mutations
 * below with writes to: incidents, tasks, resources, resourceAssignments,
 * alerts, shelters, users.
 */

export const INCIDENT_FLOW: IncidentStatus[] = [
  "reported",
  "verification",
  "verified",
  "assigned",
  "in_progress",
  "resolved",
];

export const TASK_FLOW: TaskStatus[] = [
  "assigned",
  "accepted",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
];

export const INCIDENT_LABEL: Record<IncidentStatus, string> = {
  reported: "Reported",
  verification: "Verification",
  verified: "Verified",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const TASK_LABEL: Record<TaskStatus, string> = {
  assigned: "Assigned",
  accepted: "Accepted",
  on_the_way: "On the Way",
  arrived: "Arrived",
  in_progress: "In Progress",
  completed: "Completed",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

// Generic actor placeholders used to label who performed an action.
// Replace with the real logged-in citizen/authority identity once auth is wired end-to-end.
const CITIZEN = { id: "USR-001", name: "Citizen" };
const AUTHORITY = { name: "Control room" };

type Responder = {
  id: string;
  name: string;
  team: string;
  available: boolean;
};

type Shelter = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
};

type MapPin = {
  id: string;
  lat: number;
  lng: number;
  label: string;
};

type Notification = {
  id: string;
  incidentId?: string;
  title: string;
  body: string;
  at: string;
  audience: "citizen" | "authority" | "responder";
  read: boolean;
};

export interface ReportInput {
  type: DisasterType;
  severity: Severity;
  location: string;
  description: string;
  affectedPeople: number;
  imageName?: string | undefined;
}

export interface AssignTaskInput {
  incidentId: string;
  responderId: string;
  title: string;
  instructions: string;
}

export interface AlertInput {
  title: string;
  severity: Severity;
  area: string;
  message: string;
  action: string;
}

interface StoreValue {
  users: unknown[];
  incidents: Incident[];
  tasks: Task[];
  responders: Responder[];
  resources: Resource[];
  resourceAssignments: ResourceAssignment[];
  alerts: Alert[];
  shelters: Shelter[];
  mapPins: MapPin[];
  notifications: Notification[];
  lastReportedId: string | null;
  reportIncident: (input: ReportInput) => Incident;
  verifyIncident: (id: string) => void;
  rejectIncident: (id: string, reason: string) => void;
  requestInfo: (id: string, question: string) => void;
  assignTask: (input: AssignTaskInput) => void;
  advanceTask: (taskId: string) => void;
  assignResource: (resourceId: string, incidentId: string, quantity: number) => boolean;
  createAlert: (input: AlertInput) => void;
  markNotificationsRead: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const now = () => new Date().toISOString();
let counter = 1001;
let taskCounter = 501;

export function SurakshaProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceAssignments, setResourceAssignments] = useState<ResourceAssignment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shelters] = useState<Shelter[]>([]);
  const [mapPins] = useState<MapPin[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastReportedId, setLastReportedId] = useState<string | null>(null);

  const pushIncidentStatus = useCallback(
    (id: string, status: IncidentStatus, label: string, by: string, extra?: Partial<Incident>) => {
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === id
            ? {
                ...incident,
                status,
                ...extra,
                timeline: [...incident.timeline, { status, label, at: now(), by }],
              }
            : incident,
        ),
      );
    },
    [],
  );

  const notify = useCallback((title: string, body: string, incidentId?: string) => {
    setNotifications((prev) => [
      {
        id: `NTF-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        incidentId,
        title,
        body,
        at: now(),
        audience: "citizen" as const,
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const reportIncident = useCallback(
    (input: ReportInput) => {
      const id = `INC-2026-${counter++}`;
      const incident: Incident = {
        id,
        type: input.type,
        severity: input.severity,
        status: "reported",
        location: input.location,
        lat: 9.96 + Math.random() * 0.1,
        lng: 76.25 + Math.random() * 0.1,
        description: input.description,
        affectedPeople: input.affectedPeople,
        imageName: input.imageName,
        reportedBy: CITIZEN.name,
        reportedById: CITIZEN.id,
        reportedAt: now(),
        timeline: [{ status: "reported", label: "Reported by citizen", at: now(), by: CITIZEN.name }],
      };
      setIncidents((prev) => [incident, ...prev]);
      setLastReportedId(id);
      window.setTimeout(() => {
        pushIncidentStatus(id, "verification", "Received at control room — under verification", AUTHORITY.name);
      }, 2500);
      return incident;
    },
    [pushIncidentStatus],
  );

  const verifyIncident = useCallback(
    (id: string) => {
      pushIncidentStatus(id, "verified", "Verified by control room", AUTHORITY.name, {
        verifiedBy: AUTHORITY.name,
        infoRequested: undefined,
      });
      notify(
        `Report ${id} verified`,
        "Our control room confirmed your report. A response team is being assigned now.",
        id,
      );
    },
    [notify, pushIncidentStatus],
  );

  const rejectIncident = useCallback(
    (id: string, reason: string) => {
      pushIncidentStatus(id, "rejected", `Rejected — ${reason}`, AUTHORITY.name, { rejectionReason: reason });
      notify(`Report ${id} closed`, `Field check could not confirm this report. Reason: ${reason}`, id);
    },
    [notify, pushIncidentStatus],
  );

  const requestInfo = useCallback(
    (id: string, question: string) => {
      pushIncidentStatus(id, "verification", `More information requested: ${question}`, AUTHORITY.name, {
        infoRequested: question,
      });
      notify(`More details needed for ${id}`, question, id);
    },
    [notify, pushIncidentStatus],
  );

  const assignTask = useCallback(
    ({ incidentId, responderId, title, instructions }: AssignTaskInput) => {
      const incident = incidents.find((i) => i.id === incidentId);
      const responder = responders.find((r) => r.id === responderId);
      if (!incident || !responder) return;

      const task: Task = {
        id: `TSK-${taskCounter++}`,
        incidentId,
        title,
        responderId,
        teamName: responder.team,
        status: "assigned",
        priority: incident.severity,
        instructions,
        location: incident.location,
        assignedBy: AUTHORITY.name,
        assignedAt: now(),
        timeline: [{ status: "assigned", label: "Task assigned", at: now(), by: AUTHORITY.name }],
      };
      setTasks((prev) => [task, ...prev]);
      setResponders((prev) => prev.map((r) => (r.id === responderId ? { ...r, available: false } : r)));
      pushIncidentStatus(incidentId, "assigned", `Assigned to ${responder.team}`, AUTHORITY.name);
      notify(`${responder.team} assigned to ${incidentId}`, `${title} — the team has been dispatched.`, incidentId);
    },
    [incidents, notify, pushIncidentStatus, responders],
  );

  const advanceTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const next = TASK_FLOW[TASK_FLOW.indexOf(task.status) + 1];
      if (!next) return;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: next,
                timeline: [
                  ...t.timeline,
                  { status: next, label: TASK_LABEL[next], at: now(), by: t.teamName },
                ],
              }
            : t,
        ),
      );

      if (next === "completed") {
        pushIncidentStatus(task.incidentId, "resolved", "Incident resolved on ground", task.teamName);
        setResponders((prev) => prev.map((r) => (r.id === task.responderId ? { ...r, available: true } : r)));
        notify(
          `Incident ${task.incidentId} resolved`,
          `${task.teamName} completed "${task.title}". Thank you for reporting — stay safe.`,
          task.incidentId,
        );
      } else if (next === "on_the_way" || next === "arrived" || next === "in_progress") {
        pushIncidentStatus(task.incidentId, "in_progress", `${task.teamName}: ${TASK_LABEL[next]}`, task.teamName);
      }
    },
    [notify, pushIncidentStatus, tasks],
  );

  const assignResource = useCallback(
    (resourceId: string, incidentId: string, quantity: number) => {
      const resource = resources.find((r) => r.id === resourceId);
      if (!resource || quantity <= 0 || quantity > resource.total - resource.assigned) return false;
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, assigned: r.assigned + quantity } : r)),
      );
      setResourceAssignments((prev) => [
        {
          id: `RA-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          resourceId,
          incidentId,
          quantity,
          assignedBy: AUTHORITY.name,
          assignedAt: now(),
        },
        ...prev,
      ]);
      notify(
        `Resources dispatched to ${incidentId}`,
        `${quantity} ${resource.unit} of ${resource.name} released from ${resource.depot}.`,
        incidentId,
      );
      return true;
    },
    [notify, resources],
  );

  const createAlert = useCallback((input: AlertInput) => {
    setAlerts((prev) => [
      {
        id: `ALT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        ...input,
        issuedBy: AUTHORITY.name,
        issuedAt: now(),
        demo: true,
      },
      ...prev,
    ]);
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      users: [],
      incidents,
      tasks,
      responders,
      resources,
      resourceAssignments,
      alerts,
      shelters,
      mapPins,
      notifications,
      lastReportedId,
      reportIncident,
      verifyIncident,
      rejectIncident,
      requestInfo,
      assignTask,
      advanceTask,
      assignResource,
      createAlert,
      markNotificationsRead,
    }),
    [
      advanceTask,
      alerts,
      assignResource,
      assignTask,
      createAlert,
      incidents,
      lastReportedId,
      mapPins,
      markNotificationsRead,
      notifications,
      rejectIncident,
      reportIncident,
      requestInfo,
      resourceAssignments,
      resources,
      responders,
      shelters,
      tasks,
      verifyIncident,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSuraksha() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useSuraksha must be used inside SurakshaProvider");
  return ctx;
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
