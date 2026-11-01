# ERD

```mermaid
erDiagram
  USER ||--o{ PROJECT_MEMBER : joins
  PROJECT ||--o{ PROJECT_MEMBER : has
  PROJECT ||--o{ SPRINT : has
  PROJECT ||--o{ MILESTONE : has
  PROJECT ||--o{ TASK : contains
  SPRINT ||--o{ TASK : groups
  MILESTONE ||--o{ TASK : relates
  TASK ||--o{ TASK_ASSIGNEE : assigned
  USER ||--o{ TASK_ASSIGNEE : owns
  TASK ||--o{ TASK_COMMENT : comments
  PROJECT ||--o{ MEETING : has
  MEETING ||--o{ MEETING_ACTION : produces
  PROJECT ||--o{ FEEDBACK : receives
  PROJECT ||--o{ DOCUMENT : stores
  DOCUMENT ||--o{ DOCUMENT_VERSION : versions
  PROJECT ||--o{ DECISION : records
  PROJECT ||--o{ RISK : tracks
  PROJECT ||--o{ ISSUE : tracks
  PROJECT ||--o{ SUBMISSION : requires
  SUBMISSION ||--o{ SUBMISSION_REQUIREMENT : includes
  SUBMISSION ||--o{ SUBMISSION_ARTIFACT : freezes
  PROJECT ||--o{ HEALTH_SNAPSHOT : scores
  PROJECT ||--o{ CONTRIBUTION_SNAPSHOT : measures
  PROJECT ||--o{ ACTIVITY_EVENT : emits
```

## Relationship Rules
- كل entity operational تقريبًا project-scoped.
- document_version لا يتغير بعد إنشائه؛ upload جديد = version جديد.
- submission artifact يشير إلى version محدد وليس document mutable.
- health snapshot immutable historically.
- activity_event append-only.
