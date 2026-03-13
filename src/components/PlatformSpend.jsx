import React from 'react';
import { PLATFORMS } from '../constants/platforms';
import { getYesterdayStr, getFirstOfMonthStr, aggregateByPlatform } from '../utils/parseSheetData';
import { formatCurrency } from '../utils/metrics';

function getYTDRows(parsedRows) {
  const yesterday = getYesterdayStr();
  const year = yesterday.slice(0, 4);
  return parsedRows.filter((r) => r.date >= `${year}-01-01` && r.date <= yesterday);
}

function pct(part, total) {
  if (!total || total === 0) return '—';
  return (part / total * 100).toFixed(1) + '%';
}

export default function PlatformSpend({ data }) {
  const yesterday = getYesterdayStr();
  const firstOfMonth = getFirstOfMonthStr();

  const yesterdayRows = data.filter((r) => r.date === yesterday);
  const mtdRows = data.filter((r) => r.date >= firstOfMonth && r.date <= yesterday);
  const ytdRows = getYTDRows(data);

  const yByPlat = aggregateByPlatform(yesterdayRows, PLATFORMS);
  const mByPlat = aggregateByPlatform(mtdRows, PLATFORMS);
  const yByPlatYTD = aggregateByPlatform(ytdRows, PLATFORMS);

  const yTotal = PLATFORMS.reduce((s, p) => s + (yByPlat[p]?.spend || 0), 0);
  const mTotal = PLATFORMS.reduce((s, p) => s + (mByPlat[p]?.spend || 0), 0);
  const ytdTotal = PLATFORMS.reduce((s, p) => s + (yByPlatYTD[p]?.spend || 0), 0);

  const thStyle = {
    background: '#f8f9fa',
    border: '1px solid #e0e0e0',
    padding: '4px 12px',
    fontWeight: 600,
    textAlign: 'center',
    fontSize: 13,
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    border: '1px solid #e0e0e0',
    padding: '4px 12px',
    fontSize: 13,
    whiteSpace: 'nowrap',
  };
  const numStyle = { ...tdStyle, textAlign: 'right' };
  const pctStyle = { ...tdStyle, textAlign: 'right', color: '#5f6368' };
  const labelStyle = { ...tdStyle, fontWeight: 600, background: '#f8f9fa' };
  const totalLabelStyle = { ...labelStyle, borderTop: '2px solid #bbb' };
  const totalNumStyle = { ...numStyle, fontWeight: 700, borderTop: '2px solid #bbb' };
  const totalPctStyle = { ...pctStyle, fontWeight: 700, borderTop: '2px solid #bbb' };

  return (
    <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 520 }}>
        <thead>
          {/* Row 1: merged "Spend" group header */}
          <tr>
            <th style={{ ...thStyle, background: 'white', border: 'none' }} />
            <th colSpan={5} style={{ ...thStyle, textAlign: 'center' }}>Spend</th>
          </tr>
          {/* Row 2: column headers */}
          <tr>
            <th style={{ ...thStyle, textAlign: 'left', minWidth: 160 }} />
            <th style={thStyle}>Yesterday</th>
            <th style={thStyle}>% of Mix</th>
            <th style={thStyle}>MTD</th>
            <th style={thStyle}>% of Mix</th>
            <th style={thStyle}>YTD</th>
          </tr>
        </thead>
        <tbody>
          {PLATFORMS.map((platform) => {
            const ySpend = yByPlat[platform]?.spend || 0;
            const mSpend = mByPlat[platform]?.spend || 0;
            const ytdSpend = yByPlatYTD[platform]?.spend || 0;
            return (
              <tr key={platform}>
                <td style={labelStyle}>{platform}</td>
                <td style={numStyle}>{formatCurrency(ySpend)}</td>
                <td style={pctStyle}>{pct(ySpend, yTotal)}</td>
                <td style={numStyle}>{formatCurrency(mSpend)}</td>
                <td style={pctStyle}>{pct(mSpend, mTotal)}</td>
                <td style={numStyle}>{formatCurrency(ytdSpend)}</td>
              </tr>
            );
          })}

          {/* Empty separator row like the original */}
          <tr>
            <td colSpan={6} style={{ ...tdStyle, background: 'white', borderLeft: 'none', borderRight: 'none', padding: '2px 0' }} />
          </tr>

          {/* Total row */}
          <tr>
            <td style={totalLabelStyle}>Total</td>
            <td style={totalNumStyle}>{formatCurrency(yTotal)}</td>
            <td style={totalPctStyle}>100.0%</td>
            <td style={totalNumStyle}>{formatCurrency(mTotal)}</td>
            <td style={totalPctStyle}>100.0%</td>
            <td style={totalNumStyle}>{formatCurrency(ytdTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
