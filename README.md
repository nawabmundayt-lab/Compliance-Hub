# PSBA Compliance Hub

**Punjab Facilities Compliance & Monitoring Dashboard** — Punjab Sahulat Bazaar Authority (PSBA), Government of the Punjab.

A complete, professional web application that monitors, in one place:

| Module | Compliance document | Rule |
|---|---|---|
| 🎡 **Joylands** (Large / Mini) | Ride **Fitness Certificates** | Expiry = Issue + **6 calendar months** |
| 🍽️ **Food Courts** | **PFA License** (Punjab Food Authority) | Status from license expiry |
| 🅿️ **Parking Stands** | Contractor **Agreements** | Days remaining = End date − today |

Statuses are computed automatically every refresh:

| Status | Rule | Configurable? |
|---|---|---|
| **EXPIRED** | expiry &lt; today | fixed |
| **CRITICAL** | 0–7 days remaining | ✔ Settings |
| **NEAR EXPIRY** | 8–30 days | ✔ Settings |
| **UPCOMING** | 31–60 days | ✔ Settings |
| **VALID** | &gt; 60 days | ✔ Settings |
| **MISSING** | no license/agreement data on file | automatic |

Design language (dark green `#0A3B1E` / gold `#F4B942` / white) is extracted from the approved PSBA report template — see **[DESIGN_LANGUAGE.md](./DESIGN_LANGUAGE.md)** and `design-tokens.css`.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

On first run the app seeds **3 demo Excel files** into `data/excel/` and imports them through the real pipeline, so every number on screen is data-driven, never hard-coded.

```bash
npm run build && npm run start     # production
```

## Using your real Excel files

1. Place your 3 Excel files (`.xlsx`) into **`data/excel/`** (any file names) — or upload them from **Settings page → Upload**.
2. Press **⟳ Refresh Data** in the top bar.
3. Check the **Data Quality** page for rows that need fixing in Excel (missing numbers/dates, duplicates, unknown districts).

### Column mapping (§25)

You do **not** need exact column names — the import layer maps many spellings (see the full table on the Settings page). For example *"Certificate Expiry Date"*, *"Expiry Date"* and *"Fitness Certificate Expiry"* all map to `expiryDate`. Sheet type (Joylands / Food Courts / Parking) is auto-detected from its headers.

Recommended sheets: **Joylands register** (facility summary incl. Total/Active/Inactive rides), **Rides** (one row per ride + its fitness certificate), **Food Courts**, **Parking Stands**.

## Daily automatic refresh (§23)

With the server running, schedule one of:

| OS | Schedule |
|---|---|
| Linux cron | `0 6 * * * node /path/to/Compliance-Hub/scripts/daily-refresh.js` |
| Windows | Task Scheduler → `node scripts\daily-refresh.js` |
| Any scheduler | POST `http://127.0.0.1:3000/api/refresh` |

Each refresh: reads all 3 Excel files → validates → normalizes → recalculates expiries, days-remaining, statuses, KPIs, alerts and the expiry calendar → shows **Last Data Refresh** + **status** in the header.

## Pages

1. **Executive Dashboard** — all Punjab-wide KPIs, overall compliance score, weakest category, action-required list, charts
2. **Joylands** — Large/Mini classification, charts by division/district/tehsil, register
3. **Fitness Certificates** — ride-level register with inline editing (✏️ Edit), 6-calendar-month auto-expiry
4. **Food Courts** — PFA license register, missing-license detection, compliance %
5. **Parking Stands** — agreement register, contractor info, compliance %
6. **Near Expiry** — all upcoming renewals across the 3 modules
7. **Expired** — everything overdue, sorted for action
8. **Expiry Calendar** — next 6 months of renewals to plan work in advance
9. **District Analysis** — district & division rollups, weakest districts
10. **Data Quality** — every validation issue with exact Excel row reference
11. **Settings** — thresholds, Excel files, uploads, column-mapping reference

## Tech stack (§31)

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Recharts · SheetJS (`xlsx`) · JSON snapshot store (`data/store.json`) — the pipeline is modular: **Import (lib/excel.ts) → Validation → Compliance engine (lib/compliance.ts) → Store (lib/store.ts) → Dashboard (app/)**, so a SQL database can replace the JSON layer without touching the UI.

## Future-ready (§32)

New document types (Fire Safety, Building Fitness, NOCs…) plug into the same `ComplianceDoc` model + `calcStatus()` engine + status badges — add a `DocType`, a column synonym entry, and a page.
