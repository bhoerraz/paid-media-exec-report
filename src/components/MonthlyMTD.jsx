import React from 'react';
import { CLIENTS, PAID_SOCIAL, PAID_SEARCH } from '../constants/platforms';
import {
  getMTDData,
  aggregateByPlatform,
  getFirstOfMonthStr,
  getYesterdayStr,
} from '../utils/parseSheetData';
import { calcROAS, calcMER, calcCAC, formatCurrency, formatROAS, formatMER } from '../utils/metrics';

const ALL_PLATFORMS = [...PAID_SOCIAL, ...PAID_SEARCH];

function buildClientPlatformMap(rows) {
  const map = {};
  const clients = [...new Set(rows.map((r) => r.client))];
  clients.forEach((client) => {
    const clientRows = rows.filter((r) => r.client === client);
    map[client] = aggregateByPlatform(clientRows, ALL_PLATFORMS);
  });
  return map;
}

function buildRollupData(clientMap) {
  const result = {};
  ALL_PLATFORMS.forEach((p) => {
    result[p] = { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 };
    Object.values(clientMap).forEach((byPlatform) => {
      result[p].spend += byPlatform[p]?.spend || 0;
      result[p].revenue += byPlatform[p]?.revenue || 0;
      result[p].shopifySales += byPlatform[p]?.shopifySales || 0;
      result[p].ncOrders += byPlatform[p]?.ncOrders || 0;
    });
  });
  return result;
}

function ClientMTDRow({ client, byPlatform }) {
  const tMeta = byPlatform['Meta']?.spend || 0;
  const tTikTok = byPlatform['TikTok']?.spend || 0;
  const tAxon = byPlatform['Axon']?.spend || 0;
  const tSnap = byPlatform['Snap']?.spend || 0;
  const tGoogle = byPlatform['Google']?.spend || 0;
  const tBing = byPlatform['Bing']?.spend || 0;
  const tPS = tMeta + tTikTok + tAxon + tSnap;
  const tSearch = tGoogle + tBing;
  const tTotal = tPS + tSearch;

  const roasMeta = calcROAS(byPlatform['Meta']?.revenue || 0, tMeta);
  const roasTikTok = calcROAS(byPlatform['TikTok']?.revenue || 0, tTikTok);
  const roasAxon = calcROAS(byPlatform['Axon']?.revenue || 0, tAxon);
  const roasSnap = calcROAS(byPlatform['Snap']?.revenue || 0, tSnap);

  const tShopify = ALL_PLATFORMS.reduce((acc, p) => acc + (byPlatform[p]?.shopifySales || 0), 0);
  const tNcOrders = ALL_PLATFORMS.reduce((acc, p) => acc + (byPlatform[p]?.ncOrders || 0), 0);

  const mer = calcMER(tShopify, tTotal);
  const cac = calcCAC(tTotal, tNcOrders);

  return (
    <tr>
      <td className="sticky-col client-cell">{client}</td>
      {/* Paid Social */}
      <td className="num-cell">{formatCurrency(tMeta)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tTikTok)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tAxon)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tSnap)}</td>
      <td className="num-cell dod-neutral">—</td>
      {/* Total PS */}
      <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(tPS)}</td>
      <td className="num-cell dod-neutral">—</td>
      {/* Search */}
      <td className="num-cell">{formatCurrency(tGoogle)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tBing)}</td>
      <td className="num-cell dod-neutral">—</td>
      {/* Total Search */}
      <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(tSearch)}</td>
      <td className="num-cell dod-neutral">—</td>
      {/* Total Spend */}
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tTotal)}</td>
      <td className="num-cell dod-neutral">—</td>
      {/* ROAS */}
      <td className="num-cell">{formatROAS(roasMeta)}</td>
      <td className="num-cell">{formatROAS(roasTikTok)}</td>
      <td className="num-cell">{formatROAS(roasAxon)}</td>
      <td className="num-cell">{formatROAS(roasSnap)}</td>
      {/* Shopify */}
      <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(tShopify)}</td>
      <td className="num-cell dod-neutral">—</td>
      {/* MER */}
      <td className="num-cell">{formatMER(mer)}</td>
      {/* CAC */}
      <td className="num-cell">{formatCurrency(cac)}</td>
    </tr>
  );
}

function RollupMTDRow({ label, rollupData, isGrandTotal = false }) {
  const tMeta = rollupData?.Meta?.spend || 0;
  const tTikTok = rollupData?.TikTok?.spend || 0;
  const tAxon = rollupData?.Axon?.spend || 0;
  const tSnap = rollupData?.Snap?.spend || 0;
  const tGoogle = rollupData?.Google?.spend || 0;
  const tBing = rollupData?.Bing?.spend || 0;
  const tPS = tMeta + tTikTok + tAxon + tSnap;
  const tSearch = tGoogle + tBing;
  const tTotal = tPS + tSearch;

  const roasMeta = calcROAS(rollupData?.Meta?.revenue || 0, tMeta);
  const roasTikTok = calcROAS(rollupData?.TikTok?.revenue || 0, tTikTok);
  const roasAxon = calcROAS(rollupData?.Axon?.revenue || 0, tAxon);
  const roasSnap = calcROAS(rollupData?.Snap?.revenue || 0, tSnap);

  const tShopify = ALL_PLATFORMS.reduce((acc, p) => acc + (rollupData?.[p]?.shopifySales || 0), 0);
  const tNcOrders = ALL_PLATFORMS.reduce((acc, p) => acc + (rollupData?.[p]?.ncOrders || 0), 0);

  const mer = calcMER(tShopify, tTotal);
  const cac = calcCAC(tTotal, tNcOrders);

  const rowClass = isGrandTotal ? 'rollup-row grand-total' : 'rollup-row';

  return (
    <tr className={rowClass}>
      <td className="sticky-col client-cell"><span style={{ fontWeight: 700 }}>{label}</span></td>
      <td className="num-cell">{formatCurrency(tMeta)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tTikTok)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tAxon)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tSnap)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tPS)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tGoogle)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatCurrency(tBing)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tSearch)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tTotal)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatROAS(roasMeta)}</td>
      <td className="num-cell">{formatROAS(roasTikTok)}</td>
      <td className="num-cell">{formatROAS(roasAxon)}</td>
      <td className="num-cell">{formatROAS(roasSnap)}</td>
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tShopify)}</td>
      <td className="num-cell dod-neutral">—</td>
      <td className="num-cell">{formatMER(mer)}</td>
      <td className="num-cell">{formatCurrency(cac)}</td>
    </tr>
  );
}

export default function MonthlyMTD({ data }) {
  const mtdRows = getMTDData(data);
  const activeClients = [...new Set(mtdRows.map((r) => r.client))];
  const clientList = activeClients.length > 0 ? activeClients : CLIENTS;

  const clientMap = buildClientPlatformMap(mtdRows);
  const grandRollup = buildRollupData(clientMap);

  const psSocialRollup = { ...grandRollup };
  PAID_SEARCH.forEach((p) => { psSocialRollup[p] = { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }; });
  const searchRollup = { ...grandRollup };
  PAID_SOCIAL.forEach((p) => { searchRollup[p] = { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }; });

  const firstOfMonth = getFirstOfMonthStr();
  const yesterday = getYesterdayStr();

  const H1 = 0, H2 = 25, H3 = 50;
  const thStyle = (top, extra = {}) => ({ top, position: 'sticky', ...extra });
  const groupTh = (top, bg = '#e8eaed') => ({ top, position: 'sticky', background: bg, borderBottom: '2px solid #c0c0c0' });

  return (
    <div className="table-scroll-container">
      <div style={{ padding: '6px 16px', background: '#e8f0fe', borderBottom: '1px solid #c5d3e8', fontSize: 12, color: '#1a73e8' }}>
        <strong>Month-to-Date</strong> &nbsp;·&nbsp; {firstOfMonth} through {yesterday} &nbsp;·&nbsp;
        <span style={{ color: '#80868b' }}>vs. Mo. Prior and vs. Yr. Prior columns are available for manual input — showing — when no prior data in feed</span>
      </div>
      <table className="sheets-table">
        <thead>
          {/* Row 1: Group headers */}
          <tr style={{ height: 25 }}>
            <th className="sticky-col" rowSpan={3} style={{ ...thStyle(H1), left: 0, zIndex: 5, textAlign: 'left', minWidth: 160, verticalAlign: 'bottom' }}>
              Client
            </th>
            <th colSpan={8} style={groupTh(H1, '#e6f4ea')}>Spend — Paid Social</th>
            <th colSpan={2} style={groupTh(H1, '#ceead6')}>Total Paid Social</th>
            <th colSpan={4} style={groupTh(H1, '#e8f0fe')}>Spend — Paid Search</th>
            <th colSpan={2} style={groupTh(H1, '#d2e3fc')}>Total Paid Search</th>
            <th colSpan={2} style={groupTh(H1, '#f1f3f4')}>Total Spend</th>
            <th colSpan={4} style={groupTh(H1, '#fce8e6')}>ROAS (7DC 0DV)</th>
            <th colSpan={2} style={groupTh(H1, '#fef9e7')}>Total Shopify Sales</th>
            <th rowSpan={3} style={{ ...thStyle(H1), background: '#f8f9fa', verticalAlign: 'bottom' }}>MER</th>
            <th rowSpan={3} style={{ ...thStyle(H1), background: '#f8f9fa', verticalAlign: 'bottom' }}>CAC</th>
          </tr>
          {/* Row 2: Platform names */}
          <tr style={{ height: 25 }}>
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>Meta</th>
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>TikTok</th>
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>Axon</th>
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>Snap</th>
            <th colSpan={2} style={thStyle(H2, { background: '#ceead6' })}>SUM</th>
            <th colSpan={2} style={thStyle(H2, { background: '#e8f0fe' })}>Google</th>
            <th colSpan={2} style={thStyle(H2, { background: '#e8f0fe' })}>Bing</th>
            <th colSpan={2} style={thStyle(H2, { background: '#d2e3fc' })}>SUM</th>
            <th colSpan={2} style={thStyle(H2, { background: '#f1f3f4' })}>SUM</th>
            <th style={thStyle(H2, { background: '#fce8e6' })}>Meta</th>
            <th style={thStyle(H2, { background: '#fce8e6' })}>TikTok</th>
            <th style={thStyle(H2, { background: '#fce8e6' })}>Axon</th>
            <th style={thStyle(H2, { background: '#fce8e6' })}>Snap</th>
            <th colSpan={2} style={thStyle(H2, { background: '#fef9e7' })}>All Platforms</th>
          </tr>
          {/* Row 3: MTD / vs. Mo. Prior */}
          <tr style={{ height: 25 }}>
            {/* For each of the paired columns: MTD + vs. Mo. Prior */}
            {['#e6f4ea','#e6f4ea','#e6f4ea','#e6f4ea','#ceead6','#e8f0fe','#e8f0fe','#d2e3fc','#f1f3f4'].map((bg, i) => (
              <React.Fragment key={i}>
                <th style={thStyle(H3, { background: bg, fontWeight: 'normal', fontSize: 11 })}>MTD</th>
                <th style={thStyle(H3, { background: bg, fontWeight: 'normal', fontSize: 11 })}>vs. Mo. Prior</th>
              </React.Fragment>
            ))}
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>Meta</th>
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>TikTok</th>
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>Axon</th>
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>Snap</th>
            <th style={thStyle(H3, { background: '#fef9e7', fontWeight: 'normal', fontSize: 11 })}>MTD</th>
            <th style={thStyle(H3, { background: '#fef9e7', fontWeight: 'normal', fontSize: 11 })}>vs. Mo. Prior</th>
          </tr>
        </thead>
        <tbody>
          {clientList.map((client) => (
            <ClientMTDRow
              key={client}
              client={client}
              byPlatform={clientMap[client] || {}}
            />
          ))}
          <RollupMTDRow label="Total Paid Social" rollupData={psSocialRollup} />
          <RollupMTDRow label="Total Paid Search" rollupData={searchRollup} />
          <RollupMTDRow label="Grand Total" rollupData={grandRollup} isGrandTotal />
        </tbody>
      </table>
    </div>
  );
}
