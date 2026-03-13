import { PLATFORM_NAME_MAP } from '../constants/platforms';

// Strip currency formatting from Supermetrics values: "$1,234.56" → 1234.56
function parseMoney(val) {
  if (val === null || val === undefined) return 0;
  const str = String(val).replace(/[$,\s]/g, '');
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

// Normalize platform name using the map, fallback to raw value
function normalizePlatform(raw) {
  const trimmed = (raw || '').trim();
  return PLATFORM_NAME_MAP[trimmed] || trimmed;
}

/**
 * Detect whether rows use the Supermetrics export format:
 *   Date | Account name | Cost | Revenue | ROAS | Cost(DoD) | Rev(DoD) | ROAS(DoD) | Platform | Consolidate Client
 * vs. the original spec format:
 *   Date | Client | Platform | Channel Type | Spend | Impressions | Clicks | Conversions | Revenue | ROAS | NC Orders | Shopify Sales
 */
function detectFormat(headerRow) {
  if (!headerRow) return 'spec';
  const h = headerRow.map((c) => (c || '').trim().toLowerCase());
  // Supermetrics format has "account name" and "consolidate client"
  if (h.includes('account name') || h.includes('consolidate client')) return 'supermetrics';
  return 'spec';
}

/**
 * Parse raw Google Sheets rows into structured data objects.
 * Supports both the original spec column order and the Supermetrics export format.
 * Row 1 = headers (index 0 in rows array), Row 2+ = data
 */
export function parseRows(rows) {
  if (!rows || rows.length < 2) return [];

  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  const format = detectFormat(headerRow);

  if (format === 'supermetrics') {
    // Supermetrics column positions (0-indexed):
    // 0: Date | 1: Account name | 2: Cost | 3: Revenue | 4: ROAS | 5: Cost(DoD) | 6: Rev(DoD) | 7: ROAS(DoD) | 8: Platform | 9: Consolidate Client
    return dataRows
      .map((row) => {
        const dateStr = (row[0] || '').trim();
        if (!dateStr || dateStr.length < 8) return null;
        const platform = normalizePlatform(row[8]);
        const client = (row[9] || row[1] || '').trim(); // prefer Consolidate Client
        return {
          date: dateStr,
          client,
          platform,
          channelType: '',
          spend: parseMoney(row[2]),
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: parseMoney(row[3]),
          roas: parseMoney(row[4]),
          ncOrders: 0,
          shopifySales: 0,
        };
      })
      .filter(Boolean);
  }

  // Original spec format
  return dataRows
    .map((row) => {
      const dateStr = (row[0] || '').trim();
      if (!dateStr) return null;
      return {
        date: dateStr,
        client: (row[1] || '').trim(),
        platform: normalizePlatform(row[2]),
        channelType: (row[3] || '').trim(),
        spend: parseMoney(row[4]),
        impressions: parseMoney(row[5]),
        clicks: parseMoney(row[6]),
        conversions: parseMoney(row[7]),
        revenue: parseMoney(row[8]),
        roas: parseMoney(row[9]),
        ncOrders: parseMoney(row[10]),
        shopifySales: parseMoney(row[11]),
      };
    })
    .filter(Boolean);
}

/**
 * Get yesterday's date string in YYYY-MM-DD format
 * Using fixed "today" of 2026-03-13 per system context
 */
export function getYesterdayStr() {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  return today.toISOString().split('T')[0];
}

/**
 * Get day-prior date string (2 days ago)
 */
export function getDayPriorStr() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().split('T')[0];
}

/**
 * Get first of current month date string
 */
export function getFirstOfMonthStr() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

/**
 * Get yesterday's data rows (filtered to yesterday's date)
 */
export function getYesterdayData(parsedRows) {
  const yesterday = getYesterdayStr();
  return parsedRows.filter((r) => r.date === yesterday);
}

/**
 * Get day-prior data rows (filtered to 2 days ago)
 */
export function getDayPriorData(parsedRows) {
  const dayPrior = getDayPriorStr();
  return parsedRows.filter((r) => r.date === dayPrior);
}

/**
 * Get last 30 days of data for a specific client, sorted newest first
 */
export function getClientHistory(parsedRows, clientName) {
  const yesterday = getYesterdayStr();
  const cutoff = new Date(yesterday);
  cutoff.setDate(cutoff.getDate() - 29); // 30 days including yesterday
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const clientRows = parsedRows.filter(
    (r) => r.client === clientName && r.date >= cutoffStr && r.date <= yesterday
  );

  // Group by date
  const byDate = {};
  clientRows.forEach((r) => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  // Sort dates newest first
  return Object.entries(byDate)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, rows]) => ({ date, rows }));
}

/**
 * Get MTD data grouped by client (first of current month through yesterday)
 */
export function getMTDData(parsedRows) {
  const yesterday = getYesterdayStr();
  const firstOfMonth = getFirstOfMonthStr();
  return parsedRows.filter((r) => r.date >= firstOfMonth && r.date <= yesterday);
}

/**
 * Aggregate platform spend/metrics for a set of rows
 */
export function aggregateByPlatform(rows, platforms) {
  const result = {};
  platforms.forEach((p) => {
    const pRows = rows.filter((r) => r.platform === p);
    result[p] = {
      spend: pRows.reduce((s, r) => s + r.spend, 0),
      impressions: pRows.reduce((s, r) => s + r.impressions, 0),
      clicks: pRows.reduce((s, r) => s + r.clicks, 0),
      conversions: pRows.reduce((s, r) => s + r.conversions, 0),
      revenue: pRows.reduce((s, r) => s + r.revenue, 0),
      ncOrders: pRows.reduce((s, r) => s + r.ncOrders, 0),
      shopifySales: pRows.reduce((s, r) => s + r.shopifySales, 0),
    };
  });
  return result;
}
