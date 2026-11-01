# Screen-by-Screen Specification & Routes

## Public/Auth
- `/login` — email/password, reset link, SSO placeholder if later.
- `/register` — account creation.
- `/forgot-password`, `/reset-password`.
- `/invite/:token` — invite context + accept after auth.

## App Shell
- `/app` redirects to last project or project selector.
- `/app/projects` project list/create.
- `/app/p/:projectSlug/*` project-scoped shell.

## Overview `/overview`
Project header, health score/trend/drivers, next milestone, upcoming deadline, blockers, supervisor feedback summary, roadmap strip, My Work, recent activity.

## My Work `/my-work`
Assigned tasks, action items, feedback, reviews, deadlines; grouped Today / This Week / Later / Overdue.

## Tasks
- `/tasks` board/list switch.
- `/tasks/:id` full task detail.
Filters persist in URL. Desktop quick-preview panel optional.

## Sprints `/sprints`
Current sprint summary, backlog, sprint history, planning and close flows.

## Roadmap `/roadmap`
Phase timeline, milestone rail, deadlines, progress, dependencies-on-demand.

## Milestones
- `/milestones`
- `/milestones/:id`
Evidence, linked tasks/docs, approval timeline.

## Meetings
- `/meetings`
- `/meetings/:id`
Calendar/list toggle, notes, decisions, action items.

## Feedback
- `/feedback`
- `/feedback/:id`
Inbox filters by status/severity/category; detail includes linked target and verification history.

## Documents
- `/documents`
- `/documents/:id`
Grid/list categories, tags, versions, official marker, preview/download.

## Decisions `/decisions`
Decision register + detail timeline; superseded linking.

## Risks & Issues
- `/risks`
- `/issues`
Risk matrix + register; issue triage list.

## Analytics `/analytics`
Health history, workload distribution, milestone punctuality, contribution category mix. Avoid vanity charts.

## Submissions
- `/submissions`
- `/submissions/:id`
Readiness, requirements, artifacts, freeze/submit history.

## Defense `/defense`
Readiness hero, sections/owners, demo script, backup, question bank, checklist, final assets; `/defense/present` read-only presentation mode.

## Activity `/activity`
Filterable chronological event feed.

## Settings
`/settings/general`, `/settings/team`, `/settings/notifications`, `/settings/appearance`, `/settings/export`.

## Admin Phase 2
`/admin/cohorts`, `/admin/projects`, `/admin/supervisors`, `/admin/templates`, `/admin/audit`.

## Per-Screen Contract
Every route must define: purpose, primary action, permissions, query states, empty state, loading skeleton, error recovery, responsive adaptation, keyboard flow, analytics events.
