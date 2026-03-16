import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { parseRows } from '../utils/parseSheetData';
import csvRaw from '../data/rawData.csv?raw';

const CACHE_KEY = 'sheet_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function parseCsvData() {
  const result = Papa.parse(csvRaw, { header: true, skipEmptyLines: true });
  // Convert to the row-array format parseRows expects
  const headers = ['Date', 'Data source', 'Account name', 'Revenue', 'Conversions', 'Cost', 'ROAS'];
  const rows = [headers, ...result.data.map((r) => [
    r['Date'],
    r['Data source'],
    r['Account name'],
    r['Revenue'],
    r['Conversions'],
    r['Cost'],
    r['ROAS'],
  ])];
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

    // No env vars — use the bundled CSV
    if (!sheetId || !apiKey || sheetId === 'your_spreadsheet_id_here') {
      const rows = parseCsvData();
      const parsed = parseRows(rows);
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
      } catch (e) { /* ignore */ }
    }

    // Fetch from Google Sheets API
    try {
      const encodedSheet = encodeURIComponent(sheetName);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedSheet}!A1:Z?key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const json = await response.json();
      const rows = json.values || [];
      const parsed = parseRows(rows);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: parsed, timestamp: Date.now() }));
      } catch (e) { /* ignore */ }
      setData(parsed);
      setIsMock(false);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch sheet data');
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, lastUpdated, isMock, refetch: () => fetchData(true) };
}
