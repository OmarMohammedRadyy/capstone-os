# Roadmap, Milestones & Timeline

## Roadmap Model
Roadmap is phase-driven, milestone-based, and derived from real work rather than decorative Gantt bars.

## Phase
name, description, order, start/end dates, status, progress strategy.
Progress = weighted child milestones/tasks depending on configuration.

## Milestone
Title, objective, owner, date, status, acceptance criteria, evidence, supervisor approval requirement, related tasks/docs.

## Status
Not Started, On Track, At Risk, Blocked, Awaiting Approval, Completed.

## Approval Workflow
Team marks Ready for Approval → Supervisor reviews evidence → Approve or Request Changes → if changes, linked feedback created → resubmit.

## Timeline UI
- Horizontal phase rail desktop.
- Vertical chronological list mobile.
- Today marker.
- Deadline risk indicator.
- Dependencies shown only on demand to avoid visual clutter.

## Default Graduation Template
1. Idea selection
2. Proposal
3. Problem & objectives
4. Requirements/SRS
5. Architecture/ERD/DFD
6. UI prototype
7. MVP
8. Feature complete
9. Testing
10. Final report
11. Presentation/demo rehearsal
12. Final defense

## Deadline Logic
At Risk if forecasted remaining work exceeds remaining planned capacity or milestone has unresolved blockers. Health engine must explain the reason.
