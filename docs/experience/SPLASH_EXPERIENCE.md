# Capstone OS — Cinematic Splash & Recurring Micro-Splash Specification

## 1. First-Visit Cinematic Splash (`4.5s – 6.5s`)
The primary splash screen introduces the core product metaphor (**Chaos → Structure**) before the user even reads a paragraph.

### Shot-by-Shot Storyboard
1. **Shot 01 — The Spark (`0.0s – 0.8s`):**
   - Deep Forest Black (`#07110A`) spatial void.
   - A tiny antique-gold point of light (`#C9A13C`) ignites at the center.
2. **Shot 02 — The Fountain Pen Stroke (`0.8s – 1.8s`):**
   - The gold point glides across space, leaving a razor-thin calligraphic/architectural stroke.
3. **Shot 03 — Floating Project Chaos (`1.5s – 3.0s`):**
   - Subtle 3D camera push reveals 8 physical project artifacts suspended in space:
     - Research Page
     - Task Card
     - Calendar Marker
     - Document Folder
     - System Diagram
     - Meeting Note
     - Presentation Slide
     - Deadline Marker
4. **Shot 04 — Organizing Chaos into Structure (`2.8s – 4.2s`):**
   - As the golden stroke passes near each artifact, the object rotates with believable inertia and locks into an aligned architectural grid.
5. **Shot 05 — Logo Formation & Final Frame (`4.0s – 5.2s`):**
   - The organized elements converge toward the center as the golden stroke completes the **Capstone OS** emblem.
   - Mask reveal of **"Capstone OS"** and **"From first idea to final defense."** (`من الفكرة الأولى وحتى يوم المناقشة`).
6. **Shot 06 — Logo-to-Interface Transition (`5.2s – 5.8s`):**
   - Instead of a generic opacity fade, the golden baseline beneath the logo expands horizontally to become the top navigation rule, parting the spatial canvas to reveal the interface underneath.

---

## 2. Skip Behavior
- After `1.5s`, a minimal, high-contrast `Skip intro` (`تخطي المقدمة`) control appears in the bottom corner (`Esc` or `Space` also triggers immediate transition).
- Clicking `Skip intro` records the `splash_skipped` analytics event and executes the fast Logo-to-Interface transition immediately.

---

## 3. Recurring Micro-Splash (`0.8s – 1.4s`)
Returning visitors are never forced to watch a 5-second intro on every visit:
- Duration: `1.1s` default (configurable in Studio).
- Visual: The central **Capstone OS** mark sits in focus while 4 minimal 3D orbital nodes gently gravitate into the emblem.
- **Smart Contextual Message:**
  - Anonymous returning visitor: *"Welcome back to Capstone OS."* / *"أهلًا بعودتك إلى Capstone OS."*
  - Authenticated user: *"Getting your workspace ready."* / *"Your next milestone is waiting."* / *"بنجهز مساحة عمل مشروعك..."* without blocking or delaying page rendering.

---

## 4. Progressive Fallback Rules
The splash system automatically downgrades to an instant Static Premium Frame when:
1. `prefers-reduced-motion: reduce` is active on the user's OS.
2. `navigator.connection.saveData` or `effectiveType === '2g'` is detected.
3. Video/3D hardware acceleration is unavailable.
4. Splash is set to `Static Premium` or disabled by the administrator in **Landing & Splash Studio**.

