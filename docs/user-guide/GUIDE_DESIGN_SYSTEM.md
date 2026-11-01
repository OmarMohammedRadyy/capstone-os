# Capstone OS — User Guide Visual & Interaction Design System

**Status:** Design System Specification for Guided Onboarding  
**Visual Direction:** Quiet Luxury + Editorial Academic Product + Deep Forest & Muted Gold

---

## 1. Visual Identity Integration

The User Guide System inherits all design tokens directly from `src/styles/globals.css` so it feels like a native architectural layer of Capstone OS:

| Token Role | Light Mode | Dark Mode | Usage in User Guide |
| :--- | :--- | :--- | :--- |
| **Primary Brand Accent** | `#163A24` (Deep Forest) | `#34A866` (Luminous Forest) | Step progress bar, primary CTA button, active stage node |
| **Institutional Gold** | `#C89B2C` (Refined Gold) | `#DFB244` (Warm Champagne) | Spotlight target frame (`1.5px`), category pill, step counter badge |
| **Warm Copper** | `#B4653A` (Warm Copper) | `#D98254` (Soft Copper) | Interactive "Learning by Doing" prompt border & action indicator |
| **Editorial Surface** | `#FFFFFF` / `#F8F7F4` | `#121B16` / `#18241E` | Guide Card surface with crisp `1px` border |
| **Backdrop Scrim** | `rgba(11, 17, 14, 0.55)` | `rgba(5, 9, 7, 0.72)` | SVG mask overlay around spotlighted target |

---

## 2. Core UI Components of the Guide System

### A. Spotlight Cutout & Target Frame (`SpotlightOverlay`)
- Uses an SVG `<mask>` with a smooth rounded rectangle cutout (`rx="10"`, `padding="6px"`) around the active `[data-guide="..."]` element.
- Surrounds the cutout with a subtle `1.5px` Muted Gold (`var(--gold)`) border and a restrained ambient ring—**zero neon glow, zero childish bouncing arrows**.
- Allows clicking directly inside the spotlighted target element when a step supports **Learning by Doing**.

### B. Unified Guide Card (`GuideCard`)
- **Header:**
  - Category badge in Muted Gold (e.g., `إدارة المشروع • خطوة 2 من 5`)
  - Role indicator badge when role-specific
  - Close / Pause button (`Escape`)
- **Body:**
  - Bold editorial title (`15px–16px`, `var(--ink)`)
  - Friendly Egyptian Arabic explanation (`13px`, relaxed line height `1.65`, `var(--ink-secondary)`)
  - Optional **"لماذا هذه الخطوة مهمة؟ / الخطوة التالية"** callout strip
  - Optional **"جرّب بنفسك (Learning by Doing)"** warm copper box when an interactive action is supported
- **Footer:**
  - Segmented progress dots/bar
  - `تخطي دلوقتي` (Skip)
  - `السابق` (Previous)
  - `التالي` / `ورّيني الصفحة دي` (Next / Auto-navigate CTA)

### C. Mobile Adaptation (`< 768px`)
- On mobile viewports (`375px`, `390px`, `430px`), anchored floating popovers are replaced with a **Fixed Bottom Sheet Card** (`rounded-t-2xl`, safe-area padding) while keeping the target element scrolled into view and highlighted above the sheet.

### D. Contextual Discovery Banner (`ContextualHintBanner`)
- Appears calmly at the top of a module on the user's first visit to that module.
- Structured into 3 concise columns:
  1. **وظيفة الشاشة دي إيه؟** (What & Why)
  2. **المفروض أعمل إيه هنا؟** (Action & Next Logical Step)
  3. **Quick Actions:** `شغّل جولة الشاشة (30 ثانية)` + `فهمت، ما تظهرش تاني`

### E. Interactive Visual Workflow Map (inside `User Guide Center`)
- A 5-stage interactive horizontal/vertical pipeline (`خطّط → نفّذ → اجتمع ووثّق → راجع وعالج → سلّم وناقش`).
- Clicking any stage highlights its connected Capstone OS modules, displays the practical workflow rule, and lets the user launch either the stage tour or jump directly to the screen.

---

## 3. Motion, RTL, and Accessibility Rules

- **Timing:** `160ms` for micro-interactions; `240ms cubic-bezier(0.22, 1, 0.36, 1)` for spotlight cutout repositioning. Respects `prefers-reduced-motion: reduce`.
- **RTL Support:** Placement automatically flips `left`/`right` in RTL mode; progress indicators, arrows, and step counters respect `dir="rtl"` and `dir="ltr"`.
- **Keyboard Navigation:**
  - `ArrowLeft` / `ArrowRight` (direction-aware) or `Enter` to advance steps
  - `Escape` to pause & save current progress (with a resume toast/banner)

