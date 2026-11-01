# Non-Functional Requirements

## Performance
- LCP target ≤2.5s p75 on normal broadband for key pages.
- API p95 reads ≤500ms for common scoped queries under target load.
- Pagination mandatory for unbounded lists.
- Optimistic UI فقط حين توجد rollback strategy.

## Availability
Target 99.5% for hosted deployment; graceful degradation for noncritical notification/analytics jobs.

## Scalability
MVP target: 5k users, 1k projects, 100 concurrent active sessions. Architecture must scale vertically first and horizontally without schema rewrite.

## Security
OWASP-aligned controls, server-side authorization, secure cookies, CSRF protections where relevant, rate limits, validation, malware/file-type policy, audit logging.

## Privacy
Collect minimum personal data. Contribution metrics explainable. No hidden behavioral surveillance.

## Accessibility
WCAG 2.2 AA target: keyboard, focus, contrast, labels, reduced motion, semantic landmarks, screen reader support.

## Localization
Arabic + English, ICU-style messages, RTL/LTR, locale-aware dates/numbers, no concatenated translated phrases.

## Maintainability
Strict TypeScript, modular domain boundaries, lint/format/test gates, ADRs, no business logic inside visual components.

## Reliability
Idempotent background jobs, transactional writes for multi-entity operations, retry with backoff for transient integrations.

## Browser Support
Latest 2 stable releases of Chromium/Firefox/Safari/Edge; responsive from 360px width.
