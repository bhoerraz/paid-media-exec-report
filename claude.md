# Paid Media Daily Snapshot Dashboard

## Project Overview

A React web application that gives the paid media team a **daily executive snapshot** of yesterday's performance across all clients and platforms. Data flows from **Supermetrics → Google Sheets → this app** via the Google Sheets API.

Leadership sees yesterday's numbers the moment they open it. They can expand to view the last 30 days per client. No spreadsheet knowledge required.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast, lightweight, easy to deploy |
| Styling | Tailwind CSS | Utility-first, no CSS files to manage |
| Data | Google Sheets API v4 | Reads directly from Supermetrics feed |
| Hosting | Vercel | Free tier, auto-deploys from GitHub |
| Auth | Google OAuth (service account) | Read-only, no user login required |

---

## Architecture

```
Supermetrics (scheduled daily)
    └── writes to Google Sheets (Raw Data tab)
            └── Google Sheets API (read-only)
                    └── React App (Vercel)
                            └── Leadership opens URL → sees yesterday
```

The app is **read-only**. It never writes to the sheet. It fetches data on page load and caches for 15 minutes.

---

## Google Sheets Data Structure

The app reads from a single sheet called `📥 Raw Data`.

**Expected columns (row 2 = headers, row 3+ = data):**

| Col | Header | Type | Example |
|---|---|---|---|
| A | Date | Date (YYYY-MM-DD) | 2025-03-12 |
| B | Client | String | Client A |
| C | Platform | String | Meta, TikTok, Axon, Snap, Google, Bing |
| D | Channel Type | String | Paid Social, Paid Search |
| E | Spend ($) | Number | 1250.00 |
| F | Impressions | Number | 48000 |
| G | Clicks | Number | 620 |
| H | Conversions | Number | 42 |
| I | Revenue Reported ($) | Number | 5800.00 |
| J | ROAS (7DC 0DV) | Number | 4.64 |
| K | NC Orders | Number | 38 |
| L | Shopify Sales ($) | Number | 6100.00 |

**Platform values Supermetrics must use exactly:**
- Paid Social: `Meta`, `TikTok`, `Axon`, `Snap`
- Paid Search: `Google`, `Bing`

---

## App Features

### Default View (Yesterday's Snapshot)
- Auto-displays yesterday's date (TODAY - 1) in the header banner
- One row per client
- Columns: platform spend (Meta, TikTok, Axon, Snap, Google, Bing) → Total Paid Social (+ DoD%) → Total Paid Search (+ DoD%) → Total Spend (+ DoD%) → ROAS by platform → Shopify Sales (+ DoD%) → MER → CAC
- Three rollup rows at the bottom: Total Paid Social, Total Paid Search, Grand Total
- DoD % shown in green (positive) or red (negative) with arrow indicators

### Expandable History (Last 30 Days)
- Each client row has an expand toggle `[▸]`
- Expanding shows the last 30 days of that client's data in a sub-table
- Date rows are sorted newest → oldest
- Collapsing hides the history rows

### Monthly MTD Tab
- Second tab: same layout but MTD numbers (first of month → yesterday)
- MoM % columns present but manually fillable (Supermetrics may not have prior-month data in the same feed)

---

## Metrics Definitions

| Metric | Formula |
|---|---|
| Total Paid Social Spend | SUM(Meta + TikTok + Axon + Snap) |
| Total Paid Search Spend | SUM(Google + Bing) |
| Total Spend | Paid Social + Paid Search |
| DoD % | (Today - Prior Day) / ABS(Prior Day) |
| ROAS | Revenue Reported / Spend (per platform) |
| Shopify Sales | SUM(Shopify Sales col) across all platforms for client |
| MER | Total Shopify Sales / Total Spend |
| CAC | Total Spend / NC Orders |

---


## .CSV Files provided by Leadership As Example
/Users/billhoerr/Desktop/executive-report/csv examples/Executive View - Paid Media Spend Tracker - DAILY SHEET.csv
/Users/billhoerr/Desktop/executive-report/csv examples/Executive View - Paid Media Spend Tracker - MONTHLY SHEET.csv
/Users/billhoerr/Desktop/executive-report/csv examples/Executive View - Paid Media Spend Tracker - Total Spend by platform.csv

## Environment Variables

Create a `.env` file at the project root (never commit this):

```bash
# Google Sheets API
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here

# Optional: Sheet name override (default: 📥 Raw Data)
VITE_RAW_SHEET_NAME=📥 Raw Data
```

**For Vercel deployment**, add these same variables in:
`Vercel Dashboard → Project → Settings → Environment Variables`

---

## Setup Instructions

### Step 1 — Install Claude Code

```bash
# macOS / Linux (native installer, no Node.js required)
curl -fsSL https://claude.ai/install.sh | bash

# Verify
claude --version
```

> **Requirements:** Claude Pro or Max subscription, or Anthropic Console account with billing.  
> **Windows:** Use Git Bash or WSL, then run the same curl command.

### Step 2 — Google Cloud Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project: `paid-media-dashboard`
3. Enable the **Google Sheets API**:
   - APIs & Services → Enable APIs → search "Google Sheets API" → Enable
4. Create an API Key:
   - APIs & Services → Credentials → Create Credentials → API Key
   - Restrict the key: Application restrictions → HTTP referrers → add your Vercel domain + `localhost`
   - API restrictions → Restrict to Google Sheets API
5. Copy the API key → add to `.env` as `VITE_GOOGLE_API_KEY`

> **Note:** This uses a simple API key (read-only public sheet). If your sheet needs to stay private, you'll use a Service Account instead — see the "Private Sheet" section below.

### Step 3 — Google Sheets Setup

1. Open your Google Sheet (the one Supermetrics writes to)
2. Make sure the raw data tab is named exactly: `📥 Raw Data`
3. Ensure row 2 has the headers listed in the Data Structure section above
4. **If keeping sheet public:** Share → Anyone with the link → Viewer
5. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit
   ```
6. Add to `.env` as `VITE_GOOGLE_SHEETS_ID`

### Step 4 — GitHub Setup

```bash
# Create new repo on github.com, then:
git clone https://github.com/YOUR_ORG/paid-media-dashboard.git
cd paid-media-dashboard
```

### Step 5 — Run Claude Code

```bash
cd paid-media-dashboard
claude
```

**Paste this prompt to Claude Code to build the app:**

```
Build a React + Vite + Tailwind CSS paid media daily snapshot dashboard.

Read CLAUDE.md for the full spec. Key requirements:
1. Fetch data from Google Sheets API using env vars VITE_GOOGLE_SHEETS_ID and VITE_GOOGLE_API_KEY
2. Parse the raw data tab (row 2 = headers, row 3+ = data)
3. Default view: yesterday's snapshot - one row per client, columns per CLAUDE.md spec
4. Each client row is expandable to show last 30 days of history
5. DoD % colored green (▲) or red (▼) with percentage
6. Three rollup rows: Total Paid Social, Total Paid Search, Grand Total
7. Second tab: Monthly MTD view with same column structure
8. Responsive, clean design - this is a leadership dashboard
9. 15-minute client-side data cache
10. Loading skeleton while data fetches
11. Error state if sheet is unreachable
```

### Step 6 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to your GitHub repo
# - Framework: Vite
# - Build command: npm run build
# - Output dir: dist
```

Then in Vercel Dashboard → Project → Settings → Environment Variables, add:
- `VITE_GOOGLE_SHEETS_ID`
- `VITE_GOOGLE_API_KEY`

Redeploy after adding env vars.

---

## Private Sheet Setup (Optional)

If you need the Google Sheet to remain private (not publicly viewable):

1. In Google Cloud Console → APIs & Services → Credentials → Create Credentials → **Service Account**
2. Name it `paid-media-dashboard-reader`
3. Grant role: **Viewer**
4. Create a JSON key → download it
5. In Google Sheets → Share → add the service account email (looks like `name@project.iam.gserviceaccount.com`) as **Viewer**
6. In your app, use the `googleapis` npm package to authenticate with the service account JSON

> For Vercel, store the entire JSON key as a single env var `VITE_GOOGLE_SERVICE_ACCOUNT_JSON`.

---

## File Structure (what Claude Code should generate)

```
paid-media-dashboard/
├── CLAUDE.md                    # This file
├── .env                         # Local env vars (gitignored)
├── .env.example                 # Committed template (no real values)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx                  # Tab routing: Daily | Monthly
│   ├── hooks/
│   │   └── useSheetData.js      # Fetch + cache Google Sheets data
│   ├── utils/
│   │   ├── parseSheetData.js    # Raw rows → structured client/date objects
│   │   └── metrics.js           # Spend, DoD%, ROAS, MER, CAC calculations
│   ├── components/
│   │   ├── DailySnapshot.jsx    # Yesterday view with expand/collapse
│   │   ├── MonthlyMTD.jsx       # MTD view
│   │   ├── ClientRow.jsx        # Single client row with expand toggle
│   │   ├── HistoryTable.jsx     # Expanded 30-day history sub-table
│   │   ├── RollupRow.jsx        # Total PS / Total Search / Grand Total rows
│   │   ├── MetricCell.jsx       # Currency / ROAS / % formatted cell
│   │   ├── DoDCell.jsx          # DoD % with green/red + arrow
│   │   ├── LoadingSkeleton.jsx
│   │   └── ErrorState.jsx
│   └── constants/
│       └── platforms.js         # Platform names, groupings, colors
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Local dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build locally
vercel               # Deploy to Vercel
```

---

## Common Issues

| Problem | Fix |
|---|---|
| `CORS error` on Sheets API | Make sure sheet is publicly viewable OR using service account |
| `403 Forbidden` | API key restrictions too tight — add `localhost:5173` to allowed referrers in dev |
| Data not updating | Check 15-min cache — force refresh with `?nocache=1` param |
| Wrong date shown | App uses the browser's local date for TODAY-1. Confirm timezone matches team's timezone |
| Supermetrics column mismatch | Check column order in Raw Data tab matches the spec above exactly |

---

## Supermetrics Configuration Notes

When setting up your Supermetrics connector, make sure:

- **Destination:** Google Sheets, tab named `📥 Raw Data`
- **Date field** maps to column A, formatted as `YYYY-MM-DD`
- **Dimensions:** Date, Account/Client name, Platform/Channel
- **Metrics:** Spend, Impressions, Clicks, Conversions, Revenue (attributed), ROAS, NC Orders
- **Schedule:** Daily refresh, runs after midnight so yesterday's data is complete
- **Write mode:** Append (not overwrite) so history accumulates

The `Client` column (col B) values must exactly match what you put in the `CLIENTS` array in `src/constants/platforms.js`.