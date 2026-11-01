# Responsive, RTL & Accessibility

## Breakpoints
Design content-first; suggested ranges: mobile <640, tablet 640–1023, desktop ≥1024, wide ≥1440. Do not hardcode behavior solely around device names.

## Mobile
- Bottom bar exposes Overview, My Work, Tasks, Roadmap, More.
- Tables transform to cards/compact rows where horizontal scroll harms use.
- Side sheets become full-screen pages/drawers.
- Primary actions remain reachable with safe-area padding.

## Desktop
- Persistent sidebar.
- Context side panels allowed.
- Dense list/table controls.
- Keyboard shortcuts for power users.

## RTL
- Use logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`).
- Direction comes from locale root.
- Chevron/navigation icons mirror; playback/time progression icons do not blindly mirror.
- Timeline dates and mixed Latin identifiers tested manually.

## Accessibility Requirements
- WCAG 2.2 AA target.
- Landmarks: header/nav/main/aside/footer as appropriate.
- One H1 per primary view.
- Inputs have programmatic labels, descriptions and errors.
- Color is never the only status signal.
- Focus order matches visual/logical order.
- Drag-and-drop task board has keyboard alternative.
- Dialog focus trap and restoration.
- Toasts use polite/assertive live regions appropriately.
- Minimum touch target ~44px for important mobile controls.

## Test Matrix
Keyboard-only, VoiceOver/Safari, NVDA/Chrome or equivalent, 200% zoom, reduced motion, high text scaling, RTL Arabic.
