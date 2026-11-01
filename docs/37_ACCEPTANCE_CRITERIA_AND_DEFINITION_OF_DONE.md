# Acceptance Criteria & Definition of Done

## Product Acceptance
1. A leader can create a project, invite team and configure academic timeline.
2. Every member can identify their current work in ≤2 navigation actions from Overview/My Work.
3. Supervisor can create feedback linked to an artifact and verify resolution.
4. Document versions are immutable and submission snapshots reference exact versions.
5. Health score returns breakdown and drivers, not only a number.
6. Unauthorized project access fails server-side even with guessed IDs.
7. Submission cannot freeze while mandatory requirements are incomplete unless explicit privileged override policy exists.
8. Defense hub can reach 100% readiness with final assets assigned.
9. Activity history captures major domain changes.
10. Arabic RTL and English LTR work on mobile and desktop.

## UI Acceptance
- No horizontal overflow at 360px except intentionally scrollable data regions.
- All interactive elements have hover/focus/disabled/loading states.
- Skeletons match content shape.
- Dark/light theme tokens consistent.
- No generic AI-gradient aesthetic.

## Engineering Done
Typecheck/lint/tests/build green, migrations included, permissions tested, audit where needed, telemetry/logging added, docs updated, no secrets, PR reviewed.
