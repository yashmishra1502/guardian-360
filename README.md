# Guardian 360

Build a modern disaster-management hackathon prototype called SURAKSHA360 with the tagline “Report. Respond. Rescue.”

CORE WORKFLOW

Citizen Report → Authority Verify → Assign Task → Responder Accepts → Resources Assigned → Incident Resolved → Citizen Notified

PAGES / ROLES

1. Landing Page

SURAKSHA360 branding

Emergency dashboard preview

Buttons: 🚨 Report Emergency, 🗺️ Live Map, 🏠 Find Shelter

Workflow: Report → Verify → Respond → Rescue → Resolve

2. Citizen Dashboard

Current alerts, nearby incidents, shelters and risk level

Incident reporting form:
Disaster type, severity, location, description, affected people, image

Generate Incident ID like INC-2026-1042

Track status:
Reported → Verification → Verified → Assigned → In Progress → Resolved

Show notification when resolved

3. Authority Dashboard

KPIs: Total Reports, Pending, Critical, Active Responses, Resolved, Volunteers, Resources

Incident verification cards

Actions: Verify / Reject / Request Info

Verification should change incident status and allow task assignment

Assign tasks to volunteers/responders

4. Responder Dashboard

Available and assigned tasks

Task details, location, priority, instructions and resources

Status:
Assigned → Accepted → On the Way → Arrived → In Progress → Completed

5. Resource Management

Manage Food, Water, Medicines, Blankets, Ambulances, Rescue Equipment

Show available/assigned quantities

Assign resources to incidents

6. Live Disaster Map

Interactive-looking map with demo markers

🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Safe

Show incidents, shelters, hospitals, fire stations and blocked roads

Use fictional/demo data; no real API required

7. Shelter Management

Shelter cards with capacity, occupied, available spaces, food, medical support and accessibility

8. Emergency Alerts

Authority can create alerts

Show severity, affected area, time and recommended action

Clearly label demo/prototype alerts

9. SOS Mode

Large SOS button

Show simulated emergency assistance flow, current location and nearby services

Do not claim real calls/SMS are sent

10. Preparedness Center

Short BEFORE / DURING / AFTER guides for Flood, Fire, Earthquake, Cyclone, Landslide and Heatwave.

DEMO DATA

Preload realistic fictional data:

8 incidents

5 responders

6 shelters

10 resources

5 alerts

Multiple tasks

Create one complete demo scenario:
Critical Flood → Citizen reports 12 affected → Authority verifies → Rescue Team Alpha assigned → Water/Food/Ambulance assigned → Responder updates status → Incident resolved → Citizen receives notification.

DATA STRUCTURE

Prepare the app so it can later connect to Firebase/Supabase using:
users, incidents, tasks, resources, resourceAssignments, alerts, shelters

For now use local/mock data.

UI

Professional emergency-management design:

Navy/white base

Red/orange emergency accents

Clean cards, status badges, subtle shadows

Responsive/mobile-first

Fast and clear UX

Avoid excessive 3D effects

IMPORTANT: Make all dashboards connected. Actions must update incident/task/resource statuses across the relevant views. Prioritize the complete Citizen → Authority → Responder workflow over secondary features.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0832107e-4ee7-4e31-b4f9-83861848891d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
