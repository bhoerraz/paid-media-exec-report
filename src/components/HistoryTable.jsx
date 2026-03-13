import React from 'react';
import { PAID_SOCIAL, PAID_SEARCH } from '../constants/platforms';
import { aggregateByPlatform } from '../utils/parseSheetData';
import { calcDoD, calcROAS, calcMER, calcCAC, formatCurrency, formatROAS, formatMER } from '../utils/metrics';
import DoDCell from './DoDCell';

function buildMetrics(rows) {
  const allPlatforms = [...PAID_SOCIAL, ...PAID_SEARCH];
  const byPlatform = aggregateByPlatform(rows, allPlatforms);

  const meta = byPlatform['Meta']?.spend || 0;
  const tiktok = byPlatform['TikTok']?.spend || 0;
  const axon = byPlatform['Axon']?.spend || 0;
  const snap = byPlatform['Snap']?.spend || 0;
  const google = byPlatform['Google']?.spend || 0;
  const bing = byPlatform['Bing']?.spend || 0;
  const totalPS = meta + tiktok + axon + snap;
  const totalSearch = google + bing;
  const totalSpend = totalPS + totalSearch;

  const shopify = allPlatforms.reduce((acc, p) => acc + (byPlatform[p]?.shopifySales || 0), 0);
  const ncOrders = allPlatforms.reduce((acc, p) => acc + (byPlatform[p]?.ncOrders || 0), 0);
  const revenue = allPlatforms.reduce((acc, p) => acc + (byPlatform[p]?.revenue || 0), 0);

  const roasMeta = calcROAS(byPlatform['Meta']?.revenue || 0, meta);
  const roasTikTok = calcROAS(byPlatform['TikTok']?.revenue || 0, tiktok);
  const roasAxon = calcROAS(byPlatform['Axon']?.revenue || 0, axon);
  const roasSnap = calcROAS(byPlatform['Snap']?.revenue || 0, snap);

  const mer = calcMER(shopify, totalSpend);
  const cac = calcCAC(totalSpend, ncOrders);

  return { meta, tiktok, axon, snap, google, bing, totalPS, totalSearch, totalSpend, shopify, ncOrders, revenue, roasMeta, roasTikTok, roasAxon, roasSnap, mer, cac };
}

export default function HistoryTable({ history }) {
  if (!history || history.length === 0) {
    return (
      <tr>
        <td colSpan={100} style={{ padding: '6px 32px', color: '#80868b', fontStyle: 'italic', background: '#fafafa' }}>
          No history available.
        </td>
      </tr>
    );
  }

  // Pre-compute metrics for all days so we can do DoD% between consecutive rows
  const computed = history.map(({ date, rows }) => ({ date, ...buildMetrics(rows) }));
  // history is newest → oldest, so prior day for index i is index i+1
  const prior = (i) => computed[i + 1] || null;

  return (
    <>
      {computed.map((day, i) => {
        const p = prior(i);
        return (
          <tr key={day.date} style={{ background: i % 2 === 0 ? '#f0f4ff' : '#e8eeff' }}>
            {/* Date in sticky client column — indented to show it's a child */}
            <td className="sticky-col client-cell" style={{ paddingLeft: 28, color: '#5f6368', background: i % 2 === 0 ? '#f0f4ff' : '#e8eeff', borderLeft: '3px solid #1a73e8' }}>
              {day.date}
            </td>

            {/* Meta */}
            <td className="num-cell">{formatCurrency(day.meta)}</td>
            <DoDCell value={p ? calcDoD(day.meta, p.meta) : null} />

            {/* TikTok */}
            <td className="num-cell">{formatCurrency(day.tiktok)}</td>
            <DoDCell value={p ? calcDoD(day.tiktok, p.tiktok) : null} />

            {/* Axon */}
            <td className="num-cell">{formatCurrency(day.axon)}</td>
            <DoDCell value={p ? calcDoD(day.axon, p.axon) : null} />

            {/* Snap */}
            <td className="num-cell">{formatCurrency(day.snap)}</td>
            <DoDCell value={p ? calcDoD(day.snap, p.snap) : null} />

            {/* Total Paid Social */}
            <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(day.totalPS)}</td>
            <DoDCell value={p ? calcDoD(day.totalPS, p.totalPS) : null} />

            {/* Google */}
            <td className="num-cell">{formatCurrency(day.google)}</td>
            <DoDCell value={p ? calcDoD(day.google, p.google) : null} />

            {/* Bing */}
            <td className="num-cell">{formatCurrency(day.bing)}</td>
            <DoDCell value={p ? calcDoD(day.bing, p.bing) : null} />

            {/* Total Search */}
            <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(day.totalSearch)}</td>
            <DoDCell value={p ? calcDoD(day.totalSearch, p.totalSearch) : null} />

            {/* Total Spend */}
            <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(day.totalSpend)}</td>
            <DoDCell value={p ? calcDoD(day.totalSpend, p.totalSpend) : null} />

            {/* ROAS by platform */}
            <td className="num-cell">{formatROAS(day.roasMeta)}</td>
            <td className="num-cell">{formatROAS(day.roasTikTok)}</td>
            <td className="num-cell">{formatROAS(day.roasAxon)}</td>
            <td className="num-cell">{formatROAS(day.roasSnap)}</td>

            {/* Shopify Sales */}
            <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(day.shopify)}</td>
            <DoDCell value={p ? calcDoD(day.shopify, p.shopify) : null} />

            {/* MER */}
            <td className="num-cell">{formatMER(day.mer)}</td>

            {/* CAC */}
            <td className="num-cell">{formatCurrency(day.cac)}</td>
          </tr>
        );
      })}
    </>
  );
}
