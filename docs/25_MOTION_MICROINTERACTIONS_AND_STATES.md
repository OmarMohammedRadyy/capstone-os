# Motion, Microinteractions & UI States

## Principle
Motion explains change; it does not decorate waiting.

## Timing
- Hover/focus: 100–140ms.
- Small state transition: 160–200ms.
- Drawer/dialog: 200–240ms.
- Complex rearrangement: ≤300ms.

## Easing
Use one standard ease-out for entrances and ease-in-out for state changes. Avoid spring bounce in serious academic workflows.

## Examples
- Task moved: subtle position transition + status chip change.
- Health score update: number cross-fade/short count, not spinning gauge.
- Milestone approved: check mark reveal + success toast.
- File upload: real progress bar; no fake percentage.

## Loading
Skeleton reflects final layout. Use spinner only for compact inline actions. After 500–800ms, show loading state to prevent flash for fast responses.

## Empty
Each module has contextual illustration only if custom and restrained; default uses icon + title + guidance + primary action.

## Errors
Inline field errors; page errors preserve navigation and provide retry. Destructive mutation errors never silently rollback without user message.

## Success
Prefer local state confirmation; use toast for background/remote action completion.

## Reduced Motion
`prefers-reduced-motion` disables nonessential movement and replaces spatial animation with fade/instant change.
