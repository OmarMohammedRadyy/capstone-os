# Notifications, Activity & Search

## Notification Events
Assignment, mention, due soon, overdue, feedback created, feedback verified/reopened, milestone approval, submission deadline, document official version changed, invite.

## Delivery
MVP: in-app + email for high-value events. Digest optional.

## Preferences
Per category: in-app always for critical workspace changes; email toggle/frequency. Blocking feedback cannot be fully muted by responsible owner.

## Notification Lifecycle
Unread → Read; optionally archived. Deep link to entity.

## Activity Feed
Append-only human-readable events such as:
- Omar completed “API contract”.
- Supervisor requested changes on SRS v3.
- Final Report submission frozen.

Activity events are product history; audit logs are security/compliance history. Do not merge them.

## Global Search
Search dialog with keyboard shortcut. Result groups: Tasks, Milestones, Feedback, Documents, Meetings, Decisions, Risks/Issues.

## Search Ranking
Exact title > prefix > full-text content/metadata. Always scope to accessible projects.

## Empty States
Suggest relevant action, never generic “No data”. Example: “No open feedback — supervisor notes you receive will appear here.”
