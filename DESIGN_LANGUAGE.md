# Design Language — Extracted from `PSBA_Report_Builder_v20.html`

> Source of truth for all branding, color, typography, and component styling for the
> **Punjab Facilities Compliance & Monitoring Dashboard (Compliance-Hub)**.
> Every value below was taken directly from the approved PSBA HTML report template,
> so the new dashboard will visually match the existing official reports.

---

## 1. Brand Identity

| Item | Value | Source in template |
|---|---|---|
| **Organization** | Punjab Sahulat Bazaar Authority (PSBA) | Page headers: `.pg-hdr-auth-large` → "Punjab Sahulat Bazaar Authority (PSBA)" |
| **App name** | PSBA Compliance Hub — Facilities Compliance & Monitoring Dashboard | Repository + requirements doc |
| **Product line** | Sahulat Bazaar / Sahulat on the Go | Cover & toolbar titles |
| **Government affiliation** | Government of the Punjab | Embedded in logo |
| **Logo** | `assets/psba-logo.png` (extracted from template, 241 KB PNG) | Embedded `PSBA_LOGO` base64 constant |

**Logo usage rules (from template):**

- Always displayed in a **white circular badge with a gold ring**
  (`border: 2–5px solid #F4B942`, `border-radius: 50%`).
- Three established sizes:
  - **Cover / hero:** 280 px circle, 5 px gold ring + soft outer glow
  - **Page header:** 68 px circle, 2 px gold ring
  - **Sidebar:** 54 px circle, 2 px gold ring
- Image sits at 88–92 % of the circle (`object-fit: contain`), never cropped.

---

## 2. Color Scheme

### 2.1 Core brand palette (use 90 % of the time)

| Token | Hex | Usage (as in template) |
|---|---|---|
| `--brand-green` | `#0A3B1E` | Primary brand color — app bar/toolbar, sidebar, cover, headings, primary text accents (60 uses in template) |
| `--brand-green-2` | `#14522A` | Gradient partner of brand green (`linear-gradient(135deg, #0A3B1E, #14522A)`) — table headers, title pills |
| `--brand-gold` | `#F4B942` | The accent — top bands, keylines under headers, logo rings, progress bars, KPI highlights, primary CTA buttons (64 uses) |
| `--brand-gold-dark` | `#E0A82E` | Hover/active state of gold |
| `--brand-mint` | `#C8E6D9` | Soft borders, chip hover, secondary info text |
| `--brand-cream` | `#FFF3CD` | Highlight/callout backgrounds (gold-tinted) |
| `--white` | `#FFFFFF` | Cards, pages, logo badge background |
| `--bg-page` | `#EEF2EF` | App background (green-tinted neutral) |
| `--bg-input` | `#F9FDF9` | Input/textarea backgrounds |
| `--bg-tint-green` | `#E8F5E9` | Alternating rows, soft green fills |

### 2.2 Text colors

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#0A3B1E` | Headings, strong text |
| `--text-body` | `#1C3D1A` | Report body, filled values |
| `--text-secondary` | `#1C4D2D` | Subjects, sub-headings |
| `--text-muted` | `#7A9E7E` | Captions, meta info |
| `--text-grey` | `#6B7280` | Disabled / secondary UI |
| `--text-on-green` | `#FFFFFF` | Text on dark green |
| `--text-gold-hi` | `#FFE484` | Highlighted names on dark green |
| `--text-pale-green` | `#CBE5CB` | Subtitles on dark green |

### 2.3 Compliance status colors

Mapped from the template's badge/pill system + requirements doc statuses.
**This is the single most important mapping for the dashboard.**

| Status | Meaning | Color | Background | Hex |
|---|---|---|---|---|
| **VALID** | > 60 days remaining | Green | gradient `#0D6B5E → #0A3B1E` | text `#FFFFFF` |
| **UPCOMING** | 31–60 days | Blue | `#2155A3` (hover `#1A4490`) | text `#FFFFFF` |
| **NEAR EXPIRY** | 8–30 days | Amber | `#FFF3CD` bg, `#B45309` text | border `#F4B942` |
| **CRITICAL** | 0–7 days | Orange | `#D97706` (or `#B45309` solid) | text `#FFFFFF` |
| **EXPIRED** | Past expiry | Red | gradient `#BC3A3A → #8B2727` | text `#FFFFFF` |
| **MISSING / NO DATA** | No license/agreement on file | Grey | `#6B7280` | text `#FFFFFF` |

### 2.4 Supporting / module accent colors

| Token | Hex | Usage |
|---|---|---|
| `--teal` | `#0D6B5E` (hover `#0A5248`) | Secondary actions, "compliant" accents |
| `--blue` | `#2155A3` | Info actions, upcoming status |
| `--red` | `#BC3A3A` (deep `#8B2727`) | Danger, delete, expired |
| `--amber` | `#B45309` / `#D97706` | Warnings, alert banners (`linear-gradient(135deg,#B45309,#D97706)`) |
| `--success` | `#16A34A` | Success toasts/ confirmations |
| `--purple` | `#6B21A8` | Rare accent (charts only) |

### 2.5 Signature gradients (copy exactly)

```css
--grad-header:   linear-gradient(135deg, #0A3B1E 0%, #14522A 100%);  /* table heads, title pills */
--grad-teal-ok:  linear-gradient(135deg, #0D6B5E 0%, #0A3B1E 100%);  /* compliant pills */
--grad-issue:    linear-gradient(135deg, #BC3A3A 0%, #8B2727 100%);  /* issue pills */
--grad-callout:  linear-gradient(115deg, #F1F9EC 0%, #E2F0DF 100%);  /* section highlight box */
--grad-cream:    linear-gradient(135deg, #FFF9E6 0%, #FFF3CF 100%);  /* officer/meta callout */
--grad-alert:    linear-gradient(135deg, #B45309 0%, #D97706 100%);  /* top alert banner */
```

---

## 3. Typography

Straight from the template's font stack:

| Role | Font | Notes |
|---|---|---|
| **Official / print body** | `'Times New Roman', Times, serif` | Reports, certificates, formal text |
| **Display / numerals** | `'Arial Black', Arial, sans-serif` | Big KPI numbers, cover headline, sidebar labels (`letter-spacing: 4–12px`) |
| **UI / dashboard (recommended)** | `'Segoe UI', Inter, Arial, sans-serif` | The template uses Arial for UI controls; for a modern dashboard use Segoe UI/Inter — stays in the same neutral-gothic family |
| **Urdu-ready fallback** | `'Noto Nastaliq Urdu', serif` | Optional, if bilingual labels are added later |

**Scale observed in template:**

- Page titles: 20 px, weight 900, `#0A3B1E`
- Table-header pills: 0.72–1.05 rem, weight 800, UPPERCASE, `letter-spacing: 1–1.5px`, gold on green gradient
- Body: 0.9–1 rem, line-height 1.7
- KPI / big numbers: 42–88 px, Arial Black, weight 900
- Meta/labels: 9–13 px, weight bold, letter-spacing 2 px (small-caps feel)

---

## 4. Component Patterns (template → dashboard)

| Template pattern | Dashboard equivalent |
|---|---|
| Sticky dark-green toolbar, white pill buttons, gold CTA | **Top navbar**: `#0A3B1E`, white pill nav items, gold "Refresh Data" CTA |
| Gold top band on every page (`height: 8–10px; background: #F4B942`) | **Gold keyline** under navbar / on top of every card panel header |
| Circular logo in white + gold ring | Sidebar/topbar logo lockup (54–68 px) |
| Table header: green gradient, gold uppercase letter-spaced text | **All data tables** use `--grad-header` thead with `#F4B942` text |
| `.rib` highlight box: light-green gradient + 8 px gold left border + 24px radius | **Alert/action panels** ("Action Required") |
| Officer callout: cream gradient + 2 px gold border + 30px radius | **Refresh status / meta callouts** ("Last Data Refresh: …") |
| Pills `cp-ok` / `cp-issue` (gradient green/red) | **Status badges** EXPIRED/VALID etc. (colors from § 2.3) |
| Page-number block: gold bg + dark-green 42px Arial Black number | **KPI card numbers**: gold chip + Arial Black numeral |
| Wave SVG footer (green layers + gold at 65% opacity) | Footer motif / login screen artwork |
| Pill buttons `border-radius: 30–50px` | All buttons/inputs use full-round pills; cards use 12–24 px |

**Shape & depth system:**

- Border radii: pills `30/40/50px`, cards `12–24px`, inputs `8–10px`
- Shadows: cards `0 12px 28px rgba(0,0,0,0.2)` (heavy) / `0 3px 10px rgba(0,0,0,0.08)` (light); sticky bars `0 6px 14px rgba(0,0,0,0.25)`
- Hover: `transform: scale(0.97)` + brightness shift
- Overlays: `rgba(10,59,30,0.93)` (brand-green tinted modal backdrop)

---

## 5. Alignment with Requirements Doc (§ 30)

The requirements ask for **dark green / white / gold** — the template delivers exactly that,
so no new colors are being invented:

| Requirement (§30) | Template token |
|---|---|
| Dark green | `#0A3B1E` / `#14522A` |
| White | `#FFFFFF` + `#EEF2EF` app bg |
| Gold accents | `#F4B942` (+ `#E0A82E` hover) |
| Status badges | § 2.3 mapping |
| Clean cards / professional tables | § 4 patterns |
| Avoid clutter & excessive animation | 0.2s ease transitions only, `scale(0.97)` hovers |

---

## 6. Do / Don't

**Do**
- Lead with dark green surfaces; use gold **sparingly** as the signal color (bands, keylines, CTAs, status).
- Keep every status readable as a colored pill badge with white or dark text.
- Use white circular logo lockup with gold ring everywhere the brand appears.

**Don't**
- Don't introduce new brand hues (no purple/pink/teal-heavy themes).
- Don't use gold for large backgrounds — it's an accent (the template only fills page-number blocks and small badges with it).
- Don't mix sans body text with Times headings in screens — Times is reserved for printable reports; dashboard screens stay in the neutral sans family.

---

## 7. Files

- `assets/psba-logo.png` — official logo extracted from the template
- `design-tokens.css` — all values above as CSS custom properties, ready to import
- `DESIGN_LANGUAGE.md` — this document
