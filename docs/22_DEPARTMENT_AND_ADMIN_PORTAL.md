# Department & Admin Portal — Phase 2

## Department Model
Academic year/cohort, programs, supervisors, project templates, global deadlines.

## Views
- Project portfolio cards/table.
- At-risk projects.
- Upcoming submissions.
- Supervisor workload.
- Cohort progress distribution.

## Controls
Assign supervisor, publish deadline, template management, archive cohort, export reports.

## Privacy
Department admins see only authorized cohorts. Contribution detail should be scoped by policy; default aggregate over intrusive individual monitoring.

## System Admin
User support, feature flags, system health, audit explorer, storage jobs. No casual academic content access.

## Multi-Tenancy Future
If product expands to universities, introduce Organization/Tenant ID on all scoped entities with row-level constraints/policies and tenant-aware storage paths. Do not prematurely complicate MVP if only one university/team deployment is needed.
