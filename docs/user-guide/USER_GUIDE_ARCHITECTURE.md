# Capstone OS — Interactive User Guide & Guided Workflow Architecture

**Status:** Production-Ready Specification & Implementation Reference  
**Module Path:** `src/features/user-guide/`  
**API Endpoint:** `GET / POST /api/v1/user-guide/state`

---

## 1. Architectural Philosophy

The Capstone OS User Guide System is not a third-party tooltip library bolted onto the UI. It is a **first-class, context-aware, role-aware, and data-aware Guided Workflow Engine** built natively into the Capstone OS workspace shell.

Its purpose is to teach **how to run a graduation project end-to-end**:
`خطط (Plan) → قسّم (Break Down) → نفّذ (Execute) → راجع (Review) → وثّق (Document) → عالج المشاكل (Mitigate) → سلّم (Submit) → استعد للمناقشة (Defend)`

### Core Design Principles
1. **Zero Business Logic Pollution:** The Guide Engine observes application state, DOM anchors (`data-guide="..."`), routes, and custom domain events (`capstone:guide-event`) without coupling to or mutating core business services.
2. **Role-Aware Branching:** Guides and steps filter dynamically based on the active user's role (`TEAM_LEADER`, `STUDENT`, `SUPERVISOR`, `DEPARTMENT_ADMIN`, `SYSTEM_ADMIN`). Users are never instructed to click buttons they lack permission to use.
3. **Live Data Awareness:** The Onboarding Checklist and step copy adapt to actual database counts (e.g., existing tasks, members, milestones, meetings, documents, feedback, and submissions).
4. **Cross-Route Continuity:** If a tour step targets another route (e.g., moving from `/overview` to `/roadmap` or `/tasks`), the Guide Engine navigates automatically via Next.js router, waits for the target `[data-guide="..."]` element to mount, and smoothly transitions the spotlight.
5. **Graceful Target Fallback:** If a target element is absent (due to responsive viewport, empty state, or permission), the engine either falls back to a centered editorial card or skips safely—never throwing or trapping the user.
6. **Hybrid Server + Local Persistence:** Progress, active tour state, completed guides, dismissed contextual hints, and analytics events persist both in `localStorage` (for zero-latency route transitions) and on the server via `/api/v1/user-guide/state` (stored in `SystemSetting` keyed by user ID + `ActivityEvent` / telemetry).

---

## 2. Module Directory Structure

```text
src/features/user-guide/
├── types/
│   └── guide-types.ts             # Core TypeScript interfaces (Guide, GuideStep, GuideRole, WorkspaceMetrics, GuidePersistenceState, GuideEvent)
├── content/
│   └── guides-catalog.ts          # Structured bilingual content layer (Egyptian Professional Arabic + English) for all 14 guides & contextual hints
├── analytics/
│   └── guide-analytics.ts         # Non-intrusive event tracker (guide_started, guide_step_viewed, guide_step_completed, guide_skipped, guide_completed, guide_replayed, guide_dismissed)
├── engine/
│   └── guide-context.tsx          # React Provider, state machine, route synchronization, DOM target observer, custom event listener, deep-link handler (guide://*)
├── components/
│   ├── welcome-modal.tsx          # 2-Screen First-Time Welcome & Intent Selector ("أبدأ مشروع جديد" / "أنضم لفريق موجود" / "أفهم النظام الأول")
│   ├── spotlight-overlay.tsx      # SVG mask cutout + Forest/Gold subtle frame + Desktop anchored Editorial Guide Card + Mobile Bottom Sheet
│   ├── guide-center-drawer.tsx    # "دليل النظام" (User Guide Center) with search, Interactive 5-Stage Visual Workflow Map, Role filter, and Replay triggers
│   ├── onboarding-checklist.tsx   # Data-driven live checklist widget & floating pill synced with real project metrics
│   ├── contextual-hint-banner.tsx # First-time module discovery banner (Why → What → Action → Next Step) with "ما تظهرش تاني" (Don't show again)
│   └── page-guide-trigger.tsx     # Contextual "? شرح الصفحة" button in the TopBar & PageHeaders to launch the current page's mini-guide
└── index.ts                       # Public barrel exports
```

---

## 3. State Machine & Persistence Schema

```ts
export interface GuidePersistenceState {
  version: number;                        // Schema/content version (v1)
  welcomeSeen: boolean;                   // Whether the 2-step Welcome Modal was completed/dismissed
  selectedIntent?: "new_project" | "join_team" | "explore_system";
  activeGuideId: string | null;           // Currently running tour ID (for resume support)
  activeStepIndex: number;                // Current step index within activeGuideId
  pausedGuideId: string | null;           // Saved when user pauses/leaves mid-tour ("نكمل من آخر حاجة وقفنا عندها؟")
  pausedStepIndex: number;
  completedGuides: string[];              // Array of completed guide IDs
  dismissedHints: string[];               // Array of dismissed contextual page hints
  completedActions: string[];             // Array of interactive "Learning by Doing" events triggered (e.g., "task.created")
  checklistDismissed: boolean;            // Whether user minimized/closed the onboarding checklist
  updatedAt: string;
}
```

---

## 4. Deep-Linking Protocol (`guide://`)

Every guide in the catalog has a canonical ID and can be triggered from:
- Any button or help trigger via `startGuide("full-workflow")`
- URL query parameter `?guide=tasks-workflow`
- Deep-link URI `guide://project-health`, `guide://defense-readiness`, etc.

---

## 5. Interactive "Learning by Doing" Event Bus

When a user performs a real action inside Capstone OS (e.g., opening the Create Task modal, creating a task, adding a checklist item, scheduling a meeting, uploading a document, or recomputing health), components emit:

```ts
emitGuideAction("task.created");
```

If the active tour step has `waitForAction: "task.created"`, the Guide Card automatically displays the calm Egyptian Arabic confirmation micro-feedback (e.g., `"تمام، كده المهمة بقت جزء من خطة المشروع."`) and advances to the next step. Even on action steps, the user is **never trapped**—`"تخطي دلوقتي"` (Skip for now) is always available.

