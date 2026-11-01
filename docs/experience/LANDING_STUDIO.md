# Capstone OS — Landing & Splash Studio Architecture

## 1. Studio Location & Access Control
The **Landing & Splash Studio** is located inside:
`Settings → Appearance & Experience → Landing & Splash Studio`

### RBAC Permissions
| Permission Code | Allowed Roles | Capabilities |
| :--- | :--- | :--- |
| `BRANDING_VIEW` | `TEAM_LEADER`, `SUPERVISOR`, `DEPARTMENT_ADMIN`, `SYSTEM_ADMIN` | Inspect current Landing & Splash configuration, preview responsive modes, view version history. |
| `BRANDING_EDIT` | `TEAM_LEADER`, `DEPARTMENT_ADMIN`, `SYSTEM_ADMIN` | Edit drafts, reorder sections, customize bilingual copy, adjust tokens and motion sliders. |
| `BRANDING_PUBLISH` | `TEAM_LEADER`, `DEPARTMENT_ADMIN`, `SYSTEM_ADMIN` | Publish atomic snapshots to the live public landing page, schedule releases, rollback to previous versions. |
| `MEDIA_MANAGE` | `TEAM_LEADER`, `DEPARTMENT_ADMIN`, `SYSTEM_ADMIN` | Register, replace, inspect usage, and manage media assets with delete protection. |

Standard `STUDENT` members cannot modify the public website configuration.

---

## 2. Three-Pane Studio Interface
1. **Left Panel — Structured Composer & Navigation:**
   - **Landing Sections Composer:** Reorder (`Hero`, `Chaos`, `Journey`, `Universe`, `Planning`, `Execution`, `Meetings`, `Feedback`, `Documents`, `Health`, `Continuity`, `Team`, `Submission`, `Defense`, `CTA`), enable/disable sections, duplicate sections, and validate narrative order (warns if `Chaos` is placed after `Defense`, etc.).
   - **Splash Controller:** Configure `Enable Splash`, `First Visit Only`, `Recurring Micro Splash`, `Duration`, `Skip Delay`, `Splash Story Mode` (`Cinematic Full`, `Minimal Logo`, `Static Premium`, `Custom Media`), and `Exit Transition Style` (`Logo Portal`, `Line Expansion`, `Mask`, `Depth Push`, `Simple Fade`).
   - **Global Tokens & Motion:** Adjust brand palette tokens, typography scale, geometry radius/width, and global motion intensity.
   - **Media Library & SEO:** Manage video/image slots, posters, alt texts, usage tracking, and OpenGraph social metadata.
2. **Center Panel — Live Interactive Preview:**
   - Instant preview of Draft changes before publishing.
   - **Device Modes:** `Desktop (1440px)`, `Laptop (1280px)`, `Tablet (768px)`, `Mobile (390px)`.
   - **Environment Modes:** `Light` / `Dark` + `Arabic RTL` / `English LTR`.
   - **Experience Modes:** `Live Landing Page`, `First-Time Cinematic Splash`, `Recurring Micro Splash`.
3. **Right Panel — Context Inspector:**
   - Inspects the currently selected section (`Content`, `Media`, `Layout`, `Theme`, `Motion`, `Spacing`, `Visibility`, `Advanced`).

---

## 3. Atomic Draft / Publish / Version History / Rollback
- All edits inside the Studio are saved to the **Draft** configuration (`site_experience:draft`).
- Public visitors exclusively read the **Published Atomic Snapshot** (`site_experience:published`), requiring only a single fast lookup with zero multi-table join overhead.
- Before publishing, the **Pre-Publish Quality Gate** checks for:
  - Missing alt text on active sections
  - Missing mobile/poster fallbacks on video sections
  - Narrative order warnings
  - Contrast & reduced-motion readiness
- Every publish creates an immutable entry in `site_experience:versions` (`Version #N`, timestamp, author, summary) enabling 1-click **Restore / Rollback**.

