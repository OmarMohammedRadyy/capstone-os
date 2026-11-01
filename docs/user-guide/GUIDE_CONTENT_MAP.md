# Capstone OS — Guide Content Map & Tour Inventory

**Status:** Complete Catalog of Interactive Tours, Steps, Targets & Validations  
**Version:** `1.0.0`

---

## 1. Tour Categories Overview

The Guide System is organized into **6 layers** so the user is never overwhelmed by a single 70-step tour:

1. **A. First-Time Welcome Experience (`welcome-modal`):** 2-screen calm welcome & intent selector.
2. **B. Core Workflow Journey (`full-workflow` & `dashboard-command`):** High-level end-to-end project lifecycle tour (7–8 focused steps).
3. **C. Module Feature Tours (11 Deep-Linkable Tours):** Dedicated 3–5 step interactive tours for each core module.
4. **D. Contextual First-Visit Hints (`contextual-hints`):** Single-card explanation shown once per module with `"ما تظهرش تاني"`.
5. **E. Live Onboarding Checklist (`onboarding-checklist`):** 6 real-data milestones that auto-complete from PostgreSQL state.
6. **F. User Guide Center (`guide-center`):** Searchable drawer with the Interactive Visual Workflow Map and one-click replay.

---

## 2. Deep-Linkable Guides Catalog (`guide://*`)

| Guide ID (`guide://...`) | Arabic Title | Target Route(s) | Eligible Roles | Steps Count | Interactive Action / Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `guide://full-workflow` | **رحلة المشروع كاملة (من الفكرة للمناقشة)** | `/overview` → `/roadmap` → `/tasks` → `/meetings` → `/feedback` → `/submissions` → `/defense` | `ALL` | 8 | Cross-page automatic navigation across the full lifecycle |
| `guide://dashboard-command` | **فهم لوحة القيادة (مركز التحكم)** | `/overview` | `ALL` | 5 | Spotlight on Health Ring, Next Milestone, Priority Actions, Pulse Strip |
| `guide://my-work-daily` | **شغلك اليومي من غير تشتت (My Work)** | `/my-work` | `STUDENT`, `TEAM_LEADER` | 3 | Spotlight on personal KPI strip, assigned tasks, and supervisor feedback queue |
| `guide://roadmap-milestones` | **خارطة الطريق والمحطات (Roadmap & Milestones)** | `/roadmap` | `ALL` | 4 | Explains Phase vs. Milestone vs. Task, evidence attachment, and supervisor sign-off |
| `guide://tasks-workflow` | **إدارة المهام ودورة التنفيذ (Tasks & Kanban)** | `/tasks` | `ALL` | 5 | Includes Learning-by-Doing prompt (`task.create.opened` / `task.created` or `task.selected`) |
| `guide://sprints-execution` | **الدورات القصيرة (Sprints & Iterations)** | `/sprints` | `ALL` | 3 | Explains Sprint capacity, active iteration progress, and backlog focus |
| `guide://meetings-workflow` | **الاجتماعات وتحويل التكليفات لمهام** | `/meetings` | `ALL` | 4 | Teaches Schedule → Minutes → Action Items → One-click Task conversion |
| `guide://supervisor-feedback` | **دورة ملاحظات المشرف الأكاديمي** | `/feedback` | `ALL` | 4 | Teaches Open → Assign → Resolve with Evidence → Supervisor Verification |
| `guide://documents-versioning` | **المستندات وإدارة الإصدارات (SHA-256)** | `/documents` | `ALL` | 4 | Teaches Category filtering, Immutable Version History, and Official Deliverable badge |
| `guide://decisions-log` | **سجل القرارات الهندسية (Decisions / ADR)** | `/decisions` | `ALL` | 3 | Teaches Context → Options (Pros/Cons) → Rationale & Revision History |
| `guide://risks-issues` | **الفرق بين المخاطر والمشاكل (5×5 Matrix)** | `/risks` | `ALL` | 4 | Clarifies Risk (potential) vs. Issue (actual blocker) and the 5×5 exposure matrix |
| `guide://project-health` | **محرك صحة المشروع وتحليلات المساهمة** | `/overview` & `/analytics` | `ALL` | 4 | Explains why Health Score is a diagnostic radar (not a grade) + Bus Factor in Analytics |
| `guide://submissions-freeze` | **التسليمات ولقطة التجميد (Freeze Snapshot)** | `/submissions` | `ALL` | 4 | Teaches Mandatory Checklist → Readiness % → Freeze Snapshot → Supervisor Unfreeze |
| `guide://defense-readiness` | **غرفة عمليات المناقشة النهائية** | `/defense` & `/defense/present` | `ALL` | 4 | Teaches Speaker timer allocation, Jury Q&A bank, Field Checklist, and Jury Present Mode |

---

## 3. Stable DOM Anchor Registry (`data-guide="..."`)

Every target element uses a dedicated `data-guide` attribute so CSS refactors never break tours:

- **Global Shell (`Sidebar` & `TopBar`):**
  - `data-guide="sidebar-nav"`
  - `data-guide="topbar-search"`
  - `data-guide="topbar-quick-create"`
  - `data-guide="topbar-guide-button"`
  - `data-guide="topbar-notifications"`
- **Overview (`/overview`):**
  - `data-guide="overview-pulse-strip"`
  - `data-guide="overview-next-milestone"`
  - `data-guide="overview-health-engine"`
  - `data-guide="overview-priority-actions"`
  - `data-guide="overview-my-work"`
- **My Work (`/my-work`):**
  - `data-guide="mywork-kpi-strip"`
  - `data-guide="mywork-tasks-list"`
  - `data-guide="mywork-feedback-side"`
- **Roadmap & Milestones (`/roadmap`, `/milestones`):**
  - `data-guide="roadmap-phases-rail"`
  - `data-guide="roadmap-milestones-list"`
- **Tasks (`/tasks`):**
  - `data-guide="tasks-filter-bar"`
  - `data-guide="tasks-create-btn"`
  - `data-guide="tasks-board-columns"`
- **Sprints (`/sprints`):**
  - `data-guide="sprints-active-card"`
- **Meetings (`/meetings`):**
  - `data-guide="meetings-create-btn"`
  - `data-guide="meetings-grid"`
- **Feedback (`/feedback`):**
  - `data-guide="feedback-filter-bar"`
  - `data-guide="feedback-create-btn"`
  - `data-guide="feedback-list"`
- **Documents (`/documents`):**
  - `data-guide="documents-categories"`
  - `data-guide="documents-create-btn"`
  - `data-guide="documents-grid"`
- **Decisions (`/decisions`):**
  - `data-guide="decisions-create-btn"`
  - `data-guide="decisions-grid"`
- **Risks & Issues (`/risks`):**
  - `data-guide="risks-tabs"`
  - `data-guide="risks-matrix"`
- **Analytics (`/analytics`):**
  - `data-guide="analytics-kpi-strip"`
  - `data-guide="analytics-bus-factor"`
- **Submissions (`/submissions`):**
  - `data-guide="submissions-header"`
  - `data-guide="submissions-checklist"`
  - `data-guide="submissions-snapshots"`
- **Defense (`/defense`):**
  - `data-guide="defense-hero"`
  - `data-guide="defense-sections"`
  - `data-guide="defense-questions"`

