# Capstone OS — Media Specification & Slot Architecture

## 1. Media Categories & Naming Convention
All cinematic videos and editorial stills follow a strict slot naming convention so AI-generated and post-processed plates can be dropped into `/public/media/experience/` or linked via the **Media Library** without touching application code.

### Video Slots
| Slot Key | Filename | Aspect Ratio | Duration | Target Section |
| :--- | :--- | :--- | :--- | :--- |
| `splash-chaos-desktop` | `splash-chaos-to-system-desktop.webm` | `16:9` | `6–8s` | Cinematic Splash (Desktop) |
| `splash-chaos-mobile` | `splash-chaos-to-system-mobile.webm` | `9:16` | `6–8s` | Cinematic Splash (Mobile) |
| `hero-chaos-desktop` | `landing-hero-chaos-desktop.webm` | `16:9` | `7–10s` loop | `01` Hero (Desktop) |
| `hero-chaos-mobile` | `landing-hero-chaos-mobile.webm` | `9:16` | `7–10s` loop | `01` Hero (Mobile) |
| `roadmap-desktop` | `landing-roadmap-desktop.webm` | `16:9` | `8s` | `03` Project Journey |
| `meeting-action` | `landing-meeting-action.webm` | `16:9` | `6s` | `07` Meetings → Actions |
| `feedback-flow` | `landing-feedback.webm` | `16:9` | `6s` | `08` Supervisor Feedback |
| `documents-stack` | `landing-documents.webm` | `16:9` | `6s` | `09` Document Version Control |
| `health-sculpture` | `landing-health.webm` | `16:9` | `6s` | `10` Project Health |
| `continuity-line` | `landing-continuity.webm` | `16:9` | `6s` | `11` Nothing Gets Lost |
| `defense-desktop` | `landing-defense-desktop.webm` | `16:9` | `8s` | `14` Defense Scene |

### Poster & Editorial Image Slots
| Slot Key | Filename | Aspect Ratio | Target Usage |
| :--- | :--- | :--- | :--- |
| `hero-poster` | `landing-hero-poster.avif` | `16:9` | Hero Video Poster & Fallback |
| `academic-desk` | `landing-academic-desk.avif` | `16:9` | Planning / Workspace Editorial Still |
| `research-macro` | `landing-research-macro.avif` | `4:5` | Research & Discovery Still |
| `team-collab` | `landing-team-collaboration.avif` | `16:9` | `12` Team Collaboration Still |
| `supervisor-review` | `landing-supervisor-review.avif` | `4:5` | `08` Supervisor Feedback Still |
| `document-control` | `landing-document-control.avif` | `16:9` | `09` Document Control Still |
| `defense-poster` | `landing-defense-poster.avif` | `16:9` | `14` Defense Video Poster & Fallback |
| `university-corridor` | `landing-university-corridor.avif` | `16:9` | `15` Manifesto Atmospheric Still |
| `project-core` | `landing-project-core.avif` | `1:1` | `04` Product Universe Core Still |
| `cta-stroke` | `landing-cta-stroke.avif` | `21:9` | `16` Final CTA Still |

---

## 2. Playback, Performance & Fallback Rules
1. **Silent & Inline:** Every `<video>` element enforces `muted`, `playsInline`, `loop`, and `preload="metadata"`.
2. **Zero-Blocking LCP:** Headline typography and primary CTAs render immediately in the initial HTML payload; videos hydrate asynchronously with procedural 3D/SVG architectural plates as instant zero-latency fallbacks.
3. **Responsive Delivery:** Mobile viewports (`< 768px`) never download desktop 4K video streams; they use mobile variants or interactive procedural scenes.
4. **Usage Protection:** Every asset in the Media Library tracks which sections reference it (`Used in Hero`, `Used in Defense`) and prevents accidental deletion without explicit confirmation.

