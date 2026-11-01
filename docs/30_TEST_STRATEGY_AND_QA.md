# Test Strategy & QA

## Test Pyramid
1. Unit — health formulas, policies, validators, pure domain logic.
2. Integration — DB workflows, transactions, permissions, API contracts.
3. E2E — critical user journeys in real browser.
4. Visual/accessibility — key screens and components.

## Critical E2E Scenarios
- Register/login/project create.
- Invite and accept member.
- Create/assign/transition task.
- Start/close sprint.
- Submit milestone for supervisor approval.
- Supervisor feedback → resolve → verify.
- Upload new document version.
- Create risk and observe health impact.
- Prepare/freeze submission.
- Defense checklist flow.
- Unauthorized member cannot access another project by ID.

## Browser Coverage
Chromium primary CI, Firefox/WebKit scheduled or release gate for critical flows.

## Test Data
Factories with deterministic seeds. Never rely on production copy.

## Accessibility
Automated axe-style checks + manual keyboard/screen-reader checks on release candidate.

## Performance QA
Dashboard/API seeded with realistic project: 500 tasks, 100 feedback records, 500 activity events, 100 document versions.

## Definition of Release
All critical E2E pass, no P0/P1 bugs, security checks pass, migration dry-run succeeds, backup/restore tested.
