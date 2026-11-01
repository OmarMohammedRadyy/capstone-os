# Frontend Architecture

## Rendering Strategy
Use Server Components for data-heavy read views where beneficial; Client Components only for interactive state. Keep authorization on server regardless of rendering model.

## Feature Structure
```text
features/tasks/
  api/
  components/
  hooks/
  schemas/
  types/
  utils/
```
Shared primitives live in `components/ui`; domain-aware shared components in `components/domain`.

## State
- URL state for filters/search/sort where shareable.
- Server/cache state through framework/query utilities.
- Local component state for ephemeral UI.
- Avoid global store unless cross-tree client state clearly needs it.

## Forms
Schema shared where safe. Server validates again. Form UX: dirty state, submit disabled only when needed, field errors, unsaved changes warning on long editors.

## Data Tables
Server-side pagination/filter for large lists. Column visibility saved per user optionally.

## Error Boundaries
Route/module boundaries with retry and requestId. Never expose stack traces in production.

## Performance
- Dynamic import heavy editors/charts.
- Image optimization.
- Virtualize only genuinely long lists.
- Avoid loading all project entities on dashboard.
- Cache stable reference data carefully with project-scoped invalidation.

## Component Rules
No direct database access. No permission decisions based only on UI. Components receive typed view models rather than raw ORM objects when practical.
