import { PLATFORM_NAME_MAP, ACCOUNT_CLIENT_MAP } from '../constants/platforms';

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  const str = String(val).replace(/[$,%\s]/g, '');
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

function normalizePlatform(raw) {
  const trimmed = (raw || '').trim();
  return PLATFORM_NAME_MAP[trimmed] || trimmed;
}

function normalizeClient(accountName, platform) {
  const trimmed = (accountName || '').trim();
  // Axon has no account name — label as platform-level, skip per-client breakdown
  if (!trimmed && platform === 'Axon') return '__axon_portfolio__';
  return ACCOUNT_CLIENT_MAP[trimmed] || trimmed;
}

/**
 * Build a column-index lookup from the header row.
 * Returns a function: col('Date') → index, or -1 if missing.
 */
function buildColumnMap(headerRow) {
  const map = {};
  headerRow.forEach((h, i) => { map[(h || '').trim().toLowerCase()] = i; });
  return (name) => {
    const key = name.toLowerCase();
    return map[key] !== undefined ? map[key] : -1;
  };
}

function getVal(row, idx) {
  if (idx < 0 || idx >= row.length) return '';
  return row[idx] || '';
}

/**
 * Parse raw rows into structured data objects.
 * Uses header names so column order doesn't matter.
 * Handles: Supermetrics/sheet21 format (Date, Data source, Account name, Revenue, Cost, ROAS, Conversions)
 *          and original spec format (Date, Client, Platform, Channel Type, Spend, ...)
 */
export function parseRows(rows) {
  if (!rows || rows.length < 2) return [];

  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  const col = buildColumnMap(headerRow);

  // Detect format by checking for 'data source' or 'account name' headers
  const hasDataSource = col('data source') >= 0;
  const hasAccountName = col('account name') >= 0;

  if (hasDataSource || hasAccountName) {
    // Supermetrics format — find columns by name
    const iDate = col('date');
    const iSource = col('data source');
    const iAccount = col('account name');
    const iRevenue = col('revenue');
    const iCost = col('cost');
    const iRoas = col('roas');
    const iConversions = col('conversions');
    const iClicks = col('clicks');
    const iCpc = col('cpc');
    const iClient = col('consolidate client');

    return dataRows
      .map((row) => {
        const dateStr = getVal(row, iDate).trim();
        if (!dateStr || dateStr.length < 8) return null;
        const platform = normalizePlatform(getVal(row, iSource));
        // Prefer 'Consolidate Client' column, fall back to account name mapping
        const rawClient = iClient >= 0 ? getVal(row, iClient).trim() : '';
        const client = rawClient || normalizeClient(getVal(row, iAccount), platform);
        if (client === '__axon_portfolio__' || client === '__skip__') return null;
        return {
          date: dateStr,
          client,
          platform,
          channelType: '',
          spend: parseNum(getVal(row, iCost)),
          impressions: 0,
          clicks: parseNum(getVal(row, iClicks)),
          cpc: parseNum(getVal(row, iCpc)),
          conversions: parseNum(getVal(row, iConversions)),
          revenue: parseNum(getVal(row, iRevenue)),
          roas: parseNum(getVal(row, iRoas)),
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
        spend: parseNum(row[4]),
        impressions: parseNum(row[5]),
        clicks: parseNum(row[6]),
        conversions: parseNum(row[7]),
        revenue: parseNum(row[8]),
        roas: parseNum(row[9]),
        ncOrders: parseNum(row[10]),
        shopifySales: parseNum(row[11]),
      };
    })
    .filter(Boolean);
}

/**
 * Get yesterday's date string (today - 1) dynamically from browser clock.
 * The Daily Snapshot always shows yesterday, not today.
 */
export function getLatestDateStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Get the day before yesterday (today - 2) for DoD comparison.
 */
export function getDayPriorStr() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().split('T')[0];
}

/**
 * Get first of current month.
 */
export function getFirstOfMonthStr() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

/**
 * Get yesterday's data rows.
 */
export function getYesterdayData(parsedRows) {
  const yesterday = getLatestDateStr();
  return parsedRows.filter((r) => r.date === yesterday);
}

/**
 * Get day-prior data rows (2 days ago).
 */
export function getDayPriorData(parsedRows) {
  const dayPrior = getDayPriorStr();
  return parsedRows.filter((r) => r.date === dayPrior);
}

/**
 * Get last 30 days of data for a specific client, sorted newest first.
 */
export function getClientHistory(parsedRows, clientName) {
  const yesterday = getLatestDateStr();
  const cutoff = new Date(yesterday + 'T12:00:00');
  cutoff.setDate(cutoff.getDate() - 29);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const clientRows = parsedRows.filter(
    (r) => r.client === clientName && r.date >= cutoffStr && r.date <= yesterday
  );

  const byDate = {};
  clientRows.forEach((r) => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  return Object.entries(byDate)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, rows]) => ({ date, rows }));
}

/**
 * Get MTD data (first of current month through yesterday).
 */
export function getMTDData(parsedRows) {
  const yesterday = getLatestDateStr();
  const firstOfMonth = getFirstOfMonthStr();
  return parsedRows.filter((r) => r.date >= firstOfMonth && r.date <= yesterday);
}

/**
 * Get prior month's MTD data for the same day range.
 * E.g. if today is Mar 16, yesterday is Mar 15, MTD = Mar 1-15.
 * Prior month MTD = Feb 1-15 (same number of days into the month).
 */
export function getPriorMonthMTDData(parsedRows) {
  const yesterday = new Date(getLatestDateStr() + 'T12:00:00');
  const dayOfMonth = yesterday.getDate();

  const priorFirst = new Date(yesterday);
  priorFirst.setMonth(priorFirst.getMonth() - 1);
  priorFirst.setDate(1);
  const priorFirstStr = priorFirst.toISOString().split('T')[0];

  const priorEnd = new Date(priorFirst);
  const lastDayPrior = new Date(priorFirst.getFullYear(), priorFirst.getMonth() + 1, 0).getDate();
  priorEnd.setDate(Math.min(dayOfMonth, lastDayPrior));
  const priorEndStr = priorEnd.toISOString().split('T')[0];

  return parsedRows.filter((r) => r.date >= priorFirstStr && r.date <= priorEndStr);
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
