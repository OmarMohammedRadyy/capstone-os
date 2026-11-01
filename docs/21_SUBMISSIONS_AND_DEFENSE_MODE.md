# Submissions & Defense Mode

## Submission
Represents an academic deliverable deadline.
Fields: title, description, deadline, owner, status, supervisor approval flag, requirements.

## Requirement Types
Checklist item, required document category/version, URL, declaration, reviewer approval.

## Readiness
`completed required items / total required items × 100`, with blockers listed separately.

## Freeze
Freeze creates immutable `SubmissionSnapshot` metadata and references exact document versions. After freeze, changes require unfreeze action with reason and audit log until marked submitted.

## Status
Draft → Preparing → Ready → Frozen → Submitted → Accepted / Changes Requested.

## Defense Hub
Sections:
- Overall defense readiness.
- Presentation ownership.
- Demo script.
- Backup plan.
- Jury question bank.
- Equipment checklist.
- Final files.
- Rehearsal sessions.

## Defense Checklist Defaults
Final PPT/PDF, final report, demo build, demo credentials, offline backup/video, database seed, charger/adapters, screen resolution test, presenter order, 5/10/15-minute scripts, expected questions.

## Presentation Mode
Minimal read-only full-screen dashboard showing project title, team, latest build link/QR if configured, readiness and final artifacts. No editing controls.
