#!/usr/bin/env node
/**
 * PSBA Compliance Hub — Daily auto-refresh (§23)
 *
 * Triggers the dashboard's refresh endpoint, which re-imports every Excel
 * file in ./data/excel, validates & normalizes the rows, recalculates
 * expiry dates / days remaining / statuses / KPIs and stores the new
 * snapshot in ./data/store.json.
 *
 * Schedule it once per day (requires the web server to be running):
 *
 *   Linux cron (06:00 daily):
 *     0 6 * * *  curl -s -X POST http://127.0.0.1:3000/api/refresh >> /var/log/psba-refresh.log 2>&1
 *
 *   Windows Task Scheduler:
 *     Program:  powershell
 *     Args:     -Command "Invoke-RestMethod -Method Post http://127.0.0.1:3000/api/refresh"
 *
 *   Or simply:  node scripts/daily-refresh.js
 */

const port = process.env.PSBA_PORT || 3000;
const url = `http://127.0.0.1:${port}/api/refresh`;

async function main() {
  console.log(`[daily-refresh] ${new Date().toISOString()} → POST ${url}`);
  try {
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const j = await res.json();
    console.log(`[daily-refresh] ${j.meta?.status?.toUpperCase() || 'OK'} — ${j.meta?.message}`);
    console.log(`[daily-refresh] files: ${(j.meta?.filesProcessed || []).join(', ') || '(none)'}`);
    console.log(`[daily-refresh] facilities=${j.facilities?.length ?? 0} documents=${j.documents?.length ?? 0} qualityIssues=${j.quality?.length ?? 0}`);
  } catch (err) {
    console.error('[daily-refresh] FAILED — is the dashboard server running? Start it with: npm run start  (or  npm run dev)');
    console.error(String(err));
    process.exit(1);
  }
}

main();
