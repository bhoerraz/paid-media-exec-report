import { useState, useEffect } from 'react';
import { parseRows } from '../utils/parseSheetData';
import { PLATFORMS, PAID_SOCIAL, PAID_SEARCH } from '../constants/platforms';

const CACHE_KEY = 'sheet_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Seeded pseudo-random number generator for consistent mock data
 */
function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Generate realistic mock data for 5 clients over 35 days
 */
function generateMockData() {
  const clients = ['Acme Co', 'Blue Sky', 'Coastal Brands', 'Delta Health', 'Echo Media'];

  // Spend ranges per platform (min, max) per day
  const spendRanges = {
    Meta: [500, 3000],
    TikTok: [200, 1500],
    Axon: [100, 800],
    Snap: [150, 1000],
    Google: [300, 2000],
    Bing: [50, 500],
  };

  const channelTypes = {
    Meta: 'Paid Social',
    TikTok: 'Paid Social',
    Axon: 'Paid Social',
    Snap: 'Paid Social',
    Google: 'Paid Search',
    Bing: 'Paid Search',
  };

  const rows = [];
  const today = new Date();
  // Generate rows for each of past 35 days
  for (let daysAgo = 1; daysAgo <= 35; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    clients.forEach((client, ci) => {
      PLATFORMS.forEach((platform, pi) => {
        // Use seeded random for reproducibility per client+platform+date
        const seed = (ci * 100 + pi * 10 + daysAgo) * 7919;
        const rand = seededRand(seed);

        const [minSpend, maxSpend] = spendRanges[platform];
        const spend = Math.round((minSpend + rand() * (maxSpend - minSpend)) * 100) / 100;

        // Impressions: roughly 20-60 per dollar spent
        const impressionRate = 20 + rand() * 40;
        const impressions = Math.round(spend * impressionRate);

        // CTR: 1-4%
        const ctr = 0.01 + rand() * 0.03;
        const clicks = Math.round(impressions * ctr);

        // Conversion rate: 1-5% of clicks
        const cvr = 0.01 + rand() * 0.04;
        const conversions = Math.round(clicks * cvr);

        // AOV: $50-200
        const aov = 50 + rand() * 150;
        const revenue = Math.round(conversions * aov * 100) / 100;

        const roas = spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0;

        // NC Orders: 60-90% of conversions
        const ncRate = 0.6 + rand() * 0.3;
        const ncOrders = Math.round(conversions * ncRate);

        // Shopify Sales: revenue * 1.0-1.3 (includes organic + direct)
        const shopifyMultiplier = 1.0 + rand() * 0.3;
        const shopifySales = Math.round(revenue * shopifyMultiplier * 100) / 100;

        rows.push([
          dateStr,
          client,
          platform,
          channelTypes[platform],
          spend.toFixed(2),
          impressions,
          clicks,
          conversions,
          revenue.toFixed(2),
          roas.toFixed(2),
          ncOrders,
          shopifySales.toFixed(2),
        ]);
      });
    });
  }

  return rows;
}

export function useSheetData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    const sheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const sheetName = import.meta.env.VITE_RAW_SHEET_NAME || '📥 Raw Data';

    // If no env vars, use mock data
    if (!sheetId || !apiKey || sheetId === 'your_spreadsheet_id_here') {
      const mockRows = generateMockData();
      // Add a header row to match expected format
      const withHeader = [
        ['Date', 'Client', 'Platform', 'Channel Type', 'Spend ($)', 'Impressions', 'Clicks',
          'Conversions', 'Revenue Reported ($)', 'ROAS (7DC 0DV)', 'NC Orders', 'Shopify Sales ($)'],
        ...mockRows,
      ];
      const parsed = parseRows(withHeader);
      setData(parsed);
      setIsMock(true);
      setLastUpdated(new Date());
      setLoading(false);
      return;
    }

    // Check cache
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            setLastUpdated(new Date(timestamp));
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Cache read failed, continue to fetch
      }
    }

    // Fetch from Google Sheets API
    try {
      const encodedSheet = encodeURIComponent(sheetName);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedSheet}!A2:L?key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const rows = json.values || [];
      const parsed = parseRows(rows);

      // Save to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: parsed, timestamp: Date.now() }));
      } catch (e) {
        // Cache write failed, ignore
      }

      setData(parsed);
      setIsMock(false);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch sheet data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, lastUpdated, isMock, refetch: () => fetchData(true) };
}
