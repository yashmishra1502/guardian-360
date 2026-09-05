/**
 * SURAKSHA360 domain model.
 *
 * These interfaces mirror the collection/table shape the prototype will use
 * when it is later wired to Firebase or Supabase:
 *   users, incidents, tasks, resources, resourceAssignments, alerts, shelters
 * Until then, everything is served from local mock data (see ./seed.ts).
 */

export type Role = "citizen" | "authority" | "responder";

export type DisasterType =
  | "Flood"
  | "Fire"
  | "Earthquake"
  | "Cyclone"
  | "Landslide"
  | "Heatwave"
  | "Building Collapse"
  | "Industrial Accident";

export type Severity = "critical" | "high" | "medium" | "low";

export type IncidentStatus =
  | "reported"
  | "verification"
  | "verified"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

export type TaskStatus =
  | "assigned"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "completed";

export type ResourceCategory =
  | "Food"
  | "Water"
  | "Medicines"
  | "Blankets"
  | "Ambulances"
  | "Rescue Equipment";

export interface User {
  id: string;
  name: string;
  role: Role;
  phone: string;
  ward: string;
}

export interface TimelineEntry {
  status: IncidentStatus | TaskStatus;
  label: string;
  at: string;
  by: string;
  note?: string;
}

export interface Incident {
  id: string;
  type: DisasterType;
  severity: Severity;
  status: IncidentStatus;
  location: string;
  lat: number;
  lng: number;
  description: string;
  affectedPeople: number;
  imageName?: string;
  reportedBy: string;
  reportedById: string;
  reportedAt: string;
  verifiedBy?: string;
  infoRequested?: string;
  rejectionReason?: string;
  timeline: TimelineEntry[];
}

export interface Task {
  id: string;
  incidentId: string;
  title: string;
  responderId: string;
  teamName: string;
  status: TaskStatus;
  priority: Severity;
  instructions: string;
  location: string;
  assignedBy: string;
  assignedAt: string;
  timeline: TimelineEntry[];
}

export interface Responder {
  id: string;
  name: string;
  team: string;
  specialisation: string;
  phone: string;
  baseStation: string;
  available: boolean;
  completedMissions: number;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  unit: string;
  total: number;
  assigned: number;
  depot: string;
}

export interface ResourceAssignment {
  id: string;
  resourceId: string;
  incidentId: string;
  quantity: number;
  assignedBy: string;
  assignedAt: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: Severity;
  area: string;
  message: string;
  action: string;
  issuedBy: string;
  issuedAt: string;
  demo: boolean;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  food: boolean;
  medical: boolean;
  accessible: boolean;
  contact: string;
  lat: number;
  lng: number;
}

export interface MapPin {
  id: string;
  kind: "hospital" | "fire_station" | "blocked_road" | "shelter";
  name: string;
  detail: string;
  lat: number;
  lng: number;
}

export interface Notification {
  id: string;
  incidentId?: string;
  title: string;
  body: string;
  at: string;
  audience: Role;
  read: boolean;
}
