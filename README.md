# Paid Media Executive Dashboard

A React web application that gives the paid media team a daily executive snapshot of performance across all clients and platforms. Data flows from **Supermetrics → Google Sheets → this app** via the Google Sheets API.

Leadership sees yesterday's numbers the moment they open it. They can expand to view the last 30 days per client. No spreadsheet knowledge required.

---

## Current Status

| Component | Status |
|---|---|
| Daily Snapshot tab | Done |
| Monthly MTD tab (with MoM %) | Done |
| Total Spend by Platform tab | Done |
| Google Sheets API connection | Done |
| Supermetrics ad platform data | Done |
| Account → Client name mapping | Done (29 clients, 45 accounts, 5 platforms) |
| Shopify data (Sales, NC Orders) | **Pending** |
| MER and CAC calculations | **Pending** (blocked by Shopify data) |
| Vercel deployment | **Pending** |

---

## Next Steps (for handoff)

### 1. Get Shopify API Access Tokens (20 stores)

Each client's Shopify store needs a Custom App created to generate an API token. **Only the store owner can do this** — collaborator accounts cannot create apps.

**Send this to each store owner:**

> I need to set up automated daily reporting that pulls total sales and new customer orders from Shopify. Can you:
>
> 1. Go to **Settings → Apps and sales channels → Develop apps**
> 2. Click **Allow custom app development** (if not already enabled)
> 3. Click **Create an app** → name it `Reporting`
> 4. Go to **Configuration** → Admin API scopes → enable `read_orders`
> 5. Click **Install app** → copy the **Admin API access token**
> 6. Send me the token and your `*.myshopify.com` URL
>
> Takes about 2 minutes. Thank you!

**Collect this info for each store:**

| Client | Shopify Store URL | API Access Token |
|---|---|---|
| ColourPop | colourpop.myshopify.com | shpat_xxxx... |
| Kind Patches | kindpatches.myshopify.com | shpat_xxxx... |
| ... | ... | ... |

### 2. Create Google Apps Script for Shopify Data

Once you have the tokens, create a Google Apps Script in the same Google Sheet that:

- Calls the Shopify Admin REST API for each store daily
- Pulls **Total Sales ($)** and **New Customer Orders** per day
- Writes to a new tab called `📊 Shopify Data` with these columns:

| Date | Client | Shopify Sales ($) | New Customer Orders |
|---|---|---|---|
| 2026-03-15 | ColourPop | 42500.00 | 312 |
| 2026-03-15 | Kind Patches | 8900.00 | 67 |

- Set a daily trigger to run after Supermetrics refreshes (~4 AM)

**Shopify API endpoint for orders:**
```
GET https://{store}.myshopify.com/admin/api/2024-01/orders.json?status=any&created_at_min={date}&created_at_max={date}
```

Header: `X-Shopify-Access-Token: {token}`

### 3. Update the App to Read Shopify Tab

Once the `📊 Shopify Data` tab has data, update the app:

- In `src/hooks/useSheetData.js`: fetch the second tab alongside `📥 Raw Data`
- In `src/utils/parseSheetData.js`: join Shopify data to ad platform data by Client + Date
- MER and CAC will then calculate automatically:
  - **MER** = Shopify Sales / Total Spend
  - **CAC** = Total Spend / New Customer Orders

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then in **Vercel Dashboard → Project → Settings → Environment Variables**, add:

```
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id
VITE_GOOGLE_API_KEY=your_api_key
VITE_RAW_SHEET_NAME=📥 Raw Data
```

Redeploy after adding env vars.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Data | Google Sheets API v4 |
| Hosting | Vercel (pending) |
| Ad Platform Data | Supermetrics → Google Sheets |
| Shopify Data | Google Apps Script → Shopify API (pending) |

---

## Architecture

```
Supermetrics (daily refresh)
    └── writes to Google Sheets (📥 Raw Data tab)

Google Apps Script (daily trigger)
    └── calls Shopify API → writes to Google Sheets (📊 Shopify Data tab)

Google Sheets API (read-only)
    └── React App (Vercel)
            └── Leadership opens URL → sees yesterday's numbers
```

---

## Data Sources

### 📥 Raw Data tab (Supermetrics — working)

| Column | Header |
|---|---|
| A | Date |
| B | Account name |
| C | Data source |
| D | Conversions |
| E | Revenue |
| F | Cost |
| G | CPC |
| H | Clicks |
| I | ROAS |

### 📊 Shopify Data tab (Apps Script — pending)

| Column | Header |
|---|---|
| A | Date |
| B | Client |
| C | Shopify Sales ($) |
| D | New Customer Orders |

---

## Client / Account Mapping

The app consolidates multiple Supermetrics account names into a single client. For example:

- `Kind Patches`, `Kind Patches Retail`, `Kind Patches 🇦🇺`, `Kind Patches 🇬🇧`, `Kind Patches 🇺🇸`, `Kind Patches CET USD` → **Kind Patches**
- `EVS`, `Go ElleVet`, `ElleVet Sciences LLC`, `Ellevet Sciences Self Service` → **ElleVet**
- `House of Brands LLC Self Service` → **Higher Education**

Full mapping is in `src/constants/platforms.js` → `ACCOUNT_CLIENT_MAP`.

---

## Platform Mapping

| Supermetrics "Data source" | Dashboard Platform |
|---|---|
| Facebook Ads | Meta |
| Google Ads | Google |
| TikTok Ads | TikTok |
| Snapchat Marketing | Snap |
| Microsoft Advertising (Bing) | Bing |

---

## Metrics Definitions

| Metric | Formula | Status |
|---|---|---|
| Total Paid Social Spend | Meta + TikTok + Axon + Snap | Working |
| Total Paid Search Spend | Google + Bing | Working |
| Total Spend | Paid Social + Paid Search | Working |
| DoD % | (Yesterday - Day Prior) / abs(Day Prior) | Working |
| MoM % (MTD) | (This Month MTD - Prior Month Same Days) / abs(Prior) | Working |
| ROAS | Revenue / Spend (per platform) | Working |
| Shopify Sales | From Shopify API | **Pending** |
| MER | Shopify Sales / Total Spend | **Pending** |
| CAC | Total Spend / New Customer Orders | **Pending** |

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env with your credentials (see .env.example)
cp .env.example .env

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Environment Variables

```bash
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_RAW_SHEET_NAME=📥 Raw Data
```

**Never commit real credentials.** The `.env` file is gitignored.
