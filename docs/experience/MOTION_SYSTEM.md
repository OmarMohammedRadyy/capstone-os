# Capstone OS — Advanced Motion & Spatial Transition System

## 1. Core Motion Philosophy
All motion in Capstone OS simulates **physical weight and inertia** rather than digital stickers or playful springs.

### Strictly Prohibited Patterns
- No bounce or elastic overshoot springs.
- No 360-degree spinning icons.
- No large scale-ups (`scale > 1.05`).
- No random continuous floating loops without user or narrative purpose.
- No heavy particle clouds or sci-fi glowing HUDs.

---

## 2. Timing & Easing Tokens

| Tier | Duration | CSS Easing Curve | Usage |
| :--- | :--- | :--- | :--- |
| **Micro** | `120ms – 180ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | Button states, pills, hover borders, focus rings. |
| **Component** | `180ms – 260ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Drawers, modals, tab switches, orbit detail cards. |
| **Scene** | `450ms – 900ms` | `cubic-bezier(0.19, 1, 0.22, 1)` | Section reveals, chaos-to-grid alignment, splash transitions. |
| **Scroll Cinematic** | Continuous (`0..1`) | Linear interpolation (`lerp`) | Living Roadmap stations, Health score decomposition, Continuity line. |

---

## 3. Eight Signature Motion Primitives

1. **Mask Reveal (`motion-mask-reveal`):**
   - Headlines and editorial still frames reveal through a crisp clip-path / vertical mask with subtle `12px` upward translation.
2. **Depth Transition (`motion-depth-push`):**
   - 3D perspective (`perspective: 1200px`) pushes previous roadmap stations backward (`translateZ(-120px)`) while bringing the active station into sharp focus (`translateZ(0)`).
3. **Morph Transition (`motion-morph-card`):**
   - Physical paper note cards fold and re-proportion into structured Task or Feedback cards (`Meeting Note → Action Item → Task #42`).
4. **Continuity Line (`motion-gold-thread`):**
   - An SVG path rendered in Antique Gold (`#C9A13C`) animates `stroke-dashoffset` across sequential nodes (`Meeting → Decision → Task → Document → Milestone`).
5. **Layer Collapse (`motion-layer-collapse`):**
   - Multiple overlapping document sheets (`final.pdf`, `final2.pdf`, `final-v6.pdf`) converge along the Z-axis into a single master stack (`Version 8`).
6. **Focus Shift (`motion-focus-shift`):**
   - De-emphasized background layers soften (`opacity: 0.35`, `filter: blur(1.5px)`) while the active architectural element sharpens to `100%` clarity.
7. **Camera Pan (`motion-camera-pan`):**
   - Controlled horizontal/vertical stage translation when inspecting Product Universe orbits.
8. **Spatial Parallax (`motion-spatial-parallax`):**
   - Pointer displacement is strictly clamped to `2px – 7px` across 3 depth planes (`z-depth-1`, `z-depth-2`, `z-depth-3`).

---

## 4. Accessibility & Reduced Motion
When `prefers-reduced-motion: reduce` is enabled (or when `Reduced-Motion Fallback` is toggled in Studio):
- All 3D parallax displacements clamp to `0px`.
- Scroll-driven spatial decompositions render in their clear, organized state immediately.
- Splash transitions use a calm `200ms` opacity dissolve instead of spatial camera movement.

