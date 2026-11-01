# Contribution Analytics

## Goal
Make visible who contributed to what while avoiding simplistic ranking and surveillance.

## Inputs
- Tasks completed and reviewed.
- Task complexity/points where used.
- Document versions owned/contributed.
- Decisions authored/owned.
- Meeting action items completed.
- Feedback resolutions.
- Milestone ownership.

## Not Collected
Keystrokes, screen time, mouse activity, idle time, private messages, arbitrary online duration.

## Views
- Team contribution mix by category.
- Member activity timeline.
- Ownership map by project area.
- Bus-factor warning: critical area owned by one person only.
- Workload concentration for upcoming 7/14 days.

## Fairness
Do not display a single “best member” score by default. If a normalized contribution score is implemented for academic reporting, show its formula, source events, and limitations.

## Snapshot Schema
project_id, user_id, period_start/end, completed_tasks, points, docs_versions, feedback_resolved, actions_completed, ownership_weight, computed_at.

## Privacy
Only project members/supervisor with permission can see individual breakdowns. Department aggregate must be anonymized/authorized.
