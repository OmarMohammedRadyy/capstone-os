# UI/UX Master Specification — Premium 2026

## Design Direction
**Quiet Luxury × Editorial Productivity × Academic Command Center.**
التجربة يجب أن تبدو كمنتج عالمي مدفوع، هادئ، دقيق، سريع، وليست Dashboard مولدة آليًا.

## ممنوعات بصرية
- لا gradients بنفسجي/أزرق مبالغ فيها.
- لا glassmorphism في كل card.
- لا 3D icons عشوائية.
- لا عشرات KPI cards في صف واحد.
- لا emoji كأيقونات نظام.
- لا glowing borders إلا لحالة نادرة.
- لا نصوص ضخمة بلا وظيفة.

## Visual Character
- Canvas فاتح دافئ جدًا + surfaces بيضاء/ink dark.
- Dark mode حقيقي وليس inversion.
- Cobalt/Indigo accent واحد قوي.
- Border hairlines، shadows خفيفة جدًا، hierarchy بالمسافات والطباعة.
- Radius متوسط 12–18px حسب component، وليس pill لكل شيء.
- Dense enough for productivity, spacious enough for clarity.

## Signature Moments
1. **Project Pulse**: health ring/line with trend and top drivers, minimal motion.
2. **Timeline Rail**: milestones as editorial timeline.
3. **Command Center Header**: project context + status + next deadline.
4. **Defense Readiness**: cinematic but restrained full-width progress strip.

## Dashboard Composition
Desktop 12-column grid:
- Hero context area 8 cols: health + next milestone + primary action.
- Right rail 4 cols: next deadline, blockers, supervisor feedback.
- Second row: roadmap progress full width.
- Third: My Work 7 cols + Activity 5 cols.
No more than 6 high-priority visual groups above fold.

## Navigation
Sidebar 248px expanded / 72px compact. Group nav: Plan, Execute, Review, Deliver. Active item uses surface tint and 2px accent rail, not giant filled pill.

## Detail Pattern
Complex entities open in full page on mobile; desktop may use 440–520px side panel for quick inspect, with “Open full view”.

## Interaction
Hover 120–160ms, panel 180–240ms, route transition subtle. Respect reduced motion.

## Copy Tone
Concise, calm, specific. “3 tasks are blocked” not “Oops! Something needs attention 😅”.

## Arabic
RTL layout truly mirrored where semantically correct. Numerals/date formatting configurable. Charts keep time left→right only when needed for comprehension.
