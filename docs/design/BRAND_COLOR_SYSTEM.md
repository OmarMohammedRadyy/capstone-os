# Capstone OS — Official Brand Identity & Color System

**Document Status:** Canonical Production Specification  
**Design Philosophy:** Quiet Luxury × Editorial Productivity × Calm Professional Technology  
**Official Brand Asset:** `/public/brand/logo.png` (Botanical Forest Leaf + Golden "SA" Monogram & Fountain Pen Nib with Warm Copper Contour)

---

## 1. Visual Deconstruction of the Official Emblem (`/public/brand/logo.png`)

The official project emblem consists of four distinct chromatic layers:

1. **Deep Botanical Leaf & Veins (`#0D4A12` fill / `#062409` contour):**
   - Represents growth, academic structure, and organic branching of engineering knowledge.
   - **Product Translation:** Transformed into a lower-saturation, high-luxury institutional **Primary Forest Green** (`#163A24` in Light Mode, `#34A866` in Dark Mode) so it anchors primary CTAs, active navigation indicators, and focus states without visual fatigue.
2. **Golden "SA" Monogram & Fountain Pen Nib (`#F5D018` – `#E2A815`):**
   - Symbolizes scholarly authorship, documentation, and academic excellence.
   - **Product Translation:** Raw bright yellow (`#F5D018`) is never used on large backgrounds. Instead, it is refined into **Muted Champagne Gold** (`#C89B2C` in Light Mode, `#DFB244` in Dark Mode) with warm ivory tinting (`#FBF7EB`) for milestone achievements, official seals, and high-priority indicators.
3. **Warm Copper / Bronze Pen & Lettering Outline (`#C4732B`):**
   - Provides warm tactile separation between the golden nib and the deep green leaf.
   - **Product Translation:** Refined into **Mature Copper** (`#B4653A` / `#D48256`) for secondary warm highlights, meeting indicators, and subtle decorative accents.
4. **Deep Forest Shadow & Outline (`#062409` – `#111814`):**
   - **Product Translation:** Powers the typography ink (`#111814`) and the Dark Mode canvas (`#0B110E` / `#111915` — strictly avoiding pure `#000000`).

---

## 2. The 80 / 15 / 5 Color Distribution Rule

- **80% Warm Editorial Neutrals:** Off-white ivory surfaces in Light Mode (`#F8F7F4` / `#FFFFFF`) and Deep Forest Charcoal surfaces in Dark Mode (`#0B110E` / `#111915`).
- **15% Primary Forest Identity:** Deep forest green (`#163A24` / `#34A866`) for primary actions, active sidebar indicators, and structural headers.
- **5% Refined Gold & Warm Copper Accents:** Muted gold (`#C89B2C`) and copper (`#B4653A`) reserved strictly for milestone sign-offs, official verification badges, and focus highlights.

---

## 3. Perceptually Tuned Brand Color Scales

### 3.1 Primary Forest Green Scale (`--green-*`)

| Token | Hex | Visual Character & Usage |
| :--- | :--- | :--- |
| `Green 950` | `#0A1F13` | Deepest forest ink, dark mode elevated borders, hero accents |
| `Green 900` | `#12301E` | Primary active state (`--primary-active` in Light Mode) |
| `Green 800` | `#163A24` | **Primary Brand Color (`--primary` in Light Mode)** — 11.4:1 contrast vs white |
| `Green 700` | `#1E4D30` | Primary hover state (`--primary-hover` in Light Mode) |
| `Green 600` | `#276741` | Secondary interactive links & progress bars |
| `Green 500` | `#34A866` | **Primary Brand Color in Dark Mode** — 7.2:1 contrast vs `#0B110E` |
| `Green 400` | `#52BF80` | Dark mode hover & active chart series |
| `Green 300` | `#83D4A3` | Subtle dark mode badges and focus rings |
| `Green 200` | `#B7E6C9` | Selected row borders in Light Mode |
| `Green 100` | `#DCF2E4` | Active navigation pill background |
| `Green 50` | `#EFF8F2` | Subtle brand surface tint (`--primary-subtle` in Light Mode) |

### 3.2 Refined Gold Scale (`--gold-*`)

| Token | Hex | Visual Character & Usage |
| :--- | :--- | :--- |
| `Gold 900` | `#4E3A0B` | Text on gold badges in Light Mode |
| `Gold 700` | `#8A6514` | High-contrast accessible gold text/icon on light surfaces (`--gold-text`) |
| `Gold 600` | `#C89B2C` | **Core Refined Gold Accent (`--gold`)** — borders, icons, achievement rings |
| `Gold 500` | `#DFB244` | Dark mode gold accent & active milestone indicator |
| `Gold 200` | `#F4E2B0` | Subtle gold badge border (`--gold-border`) |
| `Gold 50` | `#FBF7EB` | Warm champagne subtle background (`--gold-subtle`) |

### 3.3 Warm Copper / Bronze Scale (`--copper-*`)

| Token | Hex | Visual Character & Usage |
| :--- | :--- | :--- |
| `Copper 700` | `#8F4D28` | High-contrast accessible copper text on light surfaces (`--copper-text`) |
| `Copper 600` | `#B4653A` | **Core Warm Copper Secondary Accent (`--copper`)** |
| `Copper 500` | `#D48256` | Dark mode copper indicator |
| `Copper 50` | `#FAF1EC` | Subtle warm terracotta tint (`--copper-subtle`) |

---

## 4. Independent Neutral Architecture (Light & Dark Modes)

### 4.1 Light Mode — Warm Editorial Ivory
- **Canvas Background (`--background` / `--canvas`):** `#F8F7F4`
- **Primary Surface (`--surface`):** `#FFFFFF`
- **Subtle / Muted Surface (`--surface-subtle` / `--surface-muted`):** `#F2F0EA`
- **Elevated / Hover Surface (`--surface-elevated` / `--surface-hover`):** `#EAE7DF`
- **Primary Ink (`--foreground` / `--ink`):** `#111814` (16.8:1 contrast)
- **Secondary Ink (`--foreground-secondary` / `--ink-secondary`):** `#4A544E` (7.4:1 contrast)
- **Muted / Tertiary Ink (`--foreground-muted` / `--ink-muted` / `--ink-tertiary`):** `#76827B` (4.6:1 contrast)
- **Default Border (`--border`):** `#E2E0D8`
- **Strong Border (`--border-strong`):** `#C7C4B8`

### 4.2 Dark Mode — Deep Forest Charcoal (Zero `#000000`)
- **Canvas Background (`--background` / `--canvas`):** `#0B110E`
- **Primary Surface (`--surface`):** `#111915`
- **Elevated / Muted Surface (`--surface-elevated` / `--surface-subtle` / `--surface-muted`):** `#17221C`
- **Hover Surface (`--surface-hover`):** `#1E2C24`
- **Primary Ink (`--foreground` / `--ink`):** `#ECEFE9` (15.2:1 contrast)
- **Secondary Ink (`--foreground-secondary` / `--ink-secondary`):** `#9BA8A0` (6.8:1 contrast)
- **Muted / Tertiary Ink (`--foreground-muted` / `--ink-muted` / `--ink-tertiary`):** `#68756D`
- **Default Border (`--border`):** `#223028`
- **Strong Border (`--border-strong`):** `#314539`
