# Tech Stack & Engineering Standards

## Baseline Stack
- Next.js 16.x Active LTS.
- React 19.3.
- TypeScript strict.
- Node.js 26 LTS.
- Tailwind CSS 4.x.
- shadcn/ui as open-code component foundation, customized heavily.
- PostgreSQL 18.x stable.
- Prisma ORM 7 stable (do not adopt RC ORM in core without ADR).
- Zod for runtime validation.
- React Hook Form where client forms need it.
- TanStack Table for complex grids where appropriate.
- Playwright E2E.
- Vitest/Jest for unit/integration according to compatibility.
- Docker for local/prod parity.

## Package Manager
pnpm with lockfile committed.

## Code Quality
- ESLint + Prettier.
- noImplicitAny, strictNullChecks.
- import boundaries enforced.
- Conventional Commits.
- Protected main branch.
- PR template requires screenshots for UI changes and test evidence.

## Source Structure
```text
src/
  app/
  components/
  features/
    tasks/
    milestones/
  domain/
  server/
    db/
    auth/
    services/
  lib/
  styles/
  i18n/
  tests/
```

## Engineering Rules
- No data fetching directly from arbitrary presentational components.
- No duplicated permission logic.
- No magic strings for status/roles.
- All mutations validate input and permission server-side.
- Use UTC in storage; render in user/project timezone.
