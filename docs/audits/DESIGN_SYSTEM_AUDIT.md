# Capstone OS — Comprehensive Design System Audit

**Audit Date:** October 2026  
**Scope:** CSS Custom Properties, Color Tokens, Typography, Radius Hierarchy, Elevation, Component Consistency, RTL/LTR Parity

---

## 1. Executive Summary

The Design System audit inspected `src/styles/globals.css`, `src/app/layout.tsx`, all UI primitives (`src/components/ui/*`), and all 18 route views. We identified three systemic visual issues that caused inconsistencies across pages and prevented the brand identity from shining through.

---

## 2. Systemic Issues Identified & Fixed

### Issue DS-01: Generic SaaS Royal Blue Instead of Logo-Derived Forest & Gold Identity
- **Location:** `src/styles/globals.css`
- **Problem:** `--accent` was set to `#3157D5` (generic royal blue) with cool slate neutrals (`#F6F7F9` light / `#0C0F14` dark).
- **Resolution:** Replaced the entire token foundation in `src/styles/globals.css` with the official **Deep Forest Green (`#163A24` / `#34A866`)**, **Refined Gold (`#C89B2C` / `#DFB244`)**, **Warm Copper (`#B4653A`)**, **Warm Ivory (`#F8F7F4`)**, and **Deep Forest Charcoal (`#0B110E`)** palette.

### Issue DS-02: Undefined CSS Variable References in Secondary Views
- **Location:** `analytics-view.tsx`, `submissions-view.tsx`, `defense-view.tsx`, `activity-timeline-view.tsx`, `project-settings-view.tsx`, `defense/present/page.tsx`
- **Problem:** Several components referenced `var(--surface-muted)`, `var(--border-strong)`, `var(--ink-tertiary)`, and `var(--surface-canvas)`, which were not defined in `src/styles/globals.css`. In browsers, undefined CSS variables evaluate to `initial` (transparent backgrounds or missing borders).
- **Resolution:** Defined the complete set of canonical semantic tokens AND all aliases in `src/styles/globals.css`:
  - Surfaces: `--background`, `--canvas`, `--surface`, `--surface-canvas`, `--surface-elevated`, `--surface-subtle`, `--surface-muted`, `--surface-hover`
  - Typography: `--foreground`, `--ink`, `--foreground-secondary`, `--ink-secondary`, `--foreground-muted`, `--ink-muted`, `--ink-tertiary`
  - Brand & Accents: `--primary`, `--primary-hover`, `--primary-active`, `--primary-subtle`, `--accent`, `--accent-hover`, `--accent-subtle`, `--gold`, `--gold-subtle`, `--copper`, `--copper-subtle`
  - Borders: `--border`, `--border-subtle`, `--border-strong`
  - Semantic Status: `--success`, `--success-subtle`, `--warning`, `--warning-subtle`, `--danger`, `--danger-subtle`, `--info`, `--info-subtle`

### Issue DS-03: Hardcoded Tailwind Palette Classes (`bg-blue-600`, `text-purple-600`, etc.)
- **Location:** `my-work/page.tsx`, `overview/page.tsx`, `task-board.tsx`, `global-search-dialog.tsx`, `analytics-view.tsx`, `submissions-view.tsx`, `defense-view.tsx`, `activity-timeline-view.tsx`
- **Problem:** Multiple views used raw Tailwind classes (`bg-purple-500`, `bg-blue-600`, `text-indigo-600`, `bg-emerald-600`) that clashed with the Deep Forest Green & Refined Gold identity and did not adapt cleanly to the warm editorial palette.
- **Resolution:** Refactored status indicators, progress bars, contribution distribution bars, and icon accents across all views to use the brand's Forest Green, Refined Gold, Warm Copper, and semantic status tokens.

### Issue DS-04: Radius Hierarchy & Page Header Standardization
- **Location:** `src/components/ui/*` and route pages
- **Problem:** Page headers were manually coded with slightly different spacing and typography on each route, and border radii varied between `rounded`, `rounded-lg`, and `rounded-2xl`.
- **Resolution:**
  - Standardized radius tokens in `globals.css`: `--radius-sm: 6px` (buttons, badges, inputs), `--radius-md: 10px` (cards, panels, tables), `--radius-lg: 14px` (dialogs, drawers, command palette).
  - Created a reusable `PageHeader` component (`src/components/ui/page-header.tsx`) and `Drawer` component (`src/components/ui/drawer.tsx`) for consistent structural rhythm.

