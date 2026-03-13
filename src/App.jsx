import React, { useState } from 'react';
import { useSheetData } from './hooks/useSheetData';
import DailySnapshot from './components/DailySnapshot';
import MonthlyMTD from './components/MonthlyMTD';
import PlatformSpend from './components/PlatformSpend';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorState from './components/ErrorState';
import { getYesterdayStr } from './utils/parseSheetData';

function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Google Sheets logo SVG icon
function SheetsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="2" fill="#0f9d58" />
      <rect x="4" y="6" width="16" height="2" rx="0.5" fill="white" />
      <rect x="4" y="10" width="16" height="2" rx="0.5" fill="white" />
      <rect x="4" y="14" width="16" height="2" rx="0.5" fill="white" />
      <rect x="4" y="18" width="10" height="2" rx="0.5" fill="white" />
      <rect x="8" y="4" width="2" height="16" rx="0.5" fill="rgba(255,255,255,0.3)" />
      <rect x="14" y="4" width="2" height="16" rx="0.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const { data, loading, error, lastUpdated, isMock, refetch } = useSheetData();

  const yesterday = getYesterdayStr();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── Top toolbar ── */}
      <div className="sheets-toolbar">
        <SheetsIcon />
        <div>
          <div className="sheets-title">Paid Media Daily Snapshot</div>
          <div style={{ fontSize: 11, color: '#5f6368', marginTop: 1 }}>
            Reporting date: <strong>{formatDate(yesterday)}</strong>
            {lastUpdated && (
              <span style={{ marginLeft: 12 }}>
                · Last updated: {formatTime(lastUpdated)}
              </span>
            )}
            {isMock && (
              <span style={{
                marginLeft: 12,
                background: '#fef3cd',
                color: '#856404',
                padding: '1px 6px',
                borderRadius: 3,
                fontSize: 11,
                border: '1px solid #ffc107',
              }}>
                Demo Mode — no .env configured
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Refresh button */}
        <button
          onClick={refetch}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid #dadce0',
            borderRadius: 4,
            padding: '4px 12px',
            fontSize: 12,
            color: '#1a73e8',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>↻</span>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data ? (
          activeTab === 'daily' ? (
            <DailySnapshot data={data} />
          ) : activeTab === 'monthly' ? (
            <MonthlyMTD data={data} />
          ) : (
            <PlatformSpend data={data} />
          )
        ) : null}
      </div>

      {/* ── Bottom tab bar (Google Sheets style) ── */}
      <div className="sheets-tab-bar">
        {/* Sheet icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ marginRight: 4, color: '#5f6368' }}
        >
          <circle cx="8" cy="8" r="7" stroke="#5f6368" strokeWidth="1.5" />
          <line x1="5" y1="8" x2="11" y2="8" stroke="#5f6368" strokeWidth="1.5" />
          <line x1="8" y1="5" x2="8" y2="11" stroke="#5f6368" strokeWidth="1.5" />
        </svg>

        <button
          className={`sheets-tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily Snapshot
        </button>

        <button
          className={`sheets-tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly MTD
        </button>

        <button
          className={`sheets-tab ${activeTab === 'platform' ? 'active' : ''}`}
          onClick={() => setActiveTab('platform')}
        >
          Total Spend by Platform
        </button>

        <div style={{ flex: 1 }} />

        {/* Data row count */}
        {data && !loading && (
          <div style={{ fontSize: 11, color: '#80868b', paddingRight: 8 }}>
            {data.length.toLocaleString()} rows loaded
          </div>
        )}
      </div>
    </div>
  );
}
