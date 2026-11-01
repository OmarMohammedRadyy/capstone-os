# Architecture Decisions & Governance

## ADR Process
Create `/docs/adr/ADR-XXXX-title.md` for choices that materially change architecture, security, persistence, core dependencies or product semantics.

## Initial Decisions
### ADR-0001 Modular Monolith
Accepted. Team/product size does not justify microservices; modular boundaries preserve future extraction.

### ADR-0002 PostgreSQL
Accepted for relational integrity, transactions, reporting and search extensions.

### ADR-0003 File binaries outside DB
Accepted. Metadata in PostgreSQL; binary versions in private object storage.

### ADR-0004 Explainable Health Engine
Accepted. Deterministic weighted scoring rather than opaque AI.

### ADR-0005 No Surveillance Contribution Tracking
Accepted. Contribution from artifacts/work records only.

### ADR-0006 Bilingual/RTL from day one
Accepted because retrofitting RTL/i18n late causes structural UI debt.

## Governance
- Product behavior change requires updated requirement + acceptance criteria.
- Schema change requires migration.
- Permission change requires tests.
- Design-token change must not be patched per-screen without updating system token/component.
- Experimental core dependency requires ADR with exit plan.
