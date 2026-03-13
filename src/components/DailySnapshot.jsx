import React from 'react';
import { CLIENTS, PAID_SOCIAL, PAID_SEARCH } from '../constants/platforms';
import {
  getYesterdayData,
  getDayPriorData,
  aggregateByPlatform,
} from '../utils/parseSheetData';
import ClientRow from './ClientRow';
import RollupRow from './RollupRow';

const ALL_PLATFORMS = [...PAID_SOCIAL, ...PAID_SEARCH];

/**
 * Build per-client aggregated platform data from a list of rows
 */
function buildClientPlatformMap(rows) {
  const map = {};
  const clients = [...new Set(rows.map((r) => r.client))];
  clients.forEach((client) => {
    const clientRows = rows.filter((r) => r.client === client);
    map[client] = aggregateByPlatform(clientRows, ALL_PLATFORMS);
  });
  return map;
}

/**
 * Sum platform data across all clients to build rollup totals
 */
function buildRollupPlatformData(clientMap) {
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

// Subset rollup data to only Paid Social platforms
function subsetRollup(fullRollup, platforms) {
  const result = {};
  platforms.forEach((p) => {
    result[p] = fullRollup[p];
  });
  return result;
}

export default function DailySnapshot({ data }) {
  const yesterdayRows = getYesterdayData(data);
  const priorRows = getDayPriorData(data);

  // Get list of active clients (those with data yesterday, or fallback to CLIENTS constant)
  const activeClients = [...new Set(yesterdayRows.map((r) => r.client))];
  const clientList = activeClients.length > 0 ? activeClients : CLIENTS;

  // Build per-client platform maps
  const todayClientMap = buildClientPlatformMap(yesterdayRows);
  const priorClientMap = buildClientPlatformMap(priorRows);

  // Build rollup totals (all clients combined)
  const grandRollup = buildRollupPlatformData(todayClientMap);
  const grandRollupPrior = buildRollupPlatformData(priorClientMap);

  // Social-only rollup
  const psRollup = subsetRollup(grandRollup, PAID_SOCIAL);
  const psRollupPrior = subsetRollup(grandRollupPrior, PAID_SOCIAL);
  const fullPsRollup = { ...psRollup, Google: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, Bing: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 } };
  const fullPsRollupPrior = { ...psRollupPrior, Google: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, Bing: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 } };

  // Search-only rollup
  const searchRollup = subsetRollup(grandRollup, PAID_SEARCH);
  const searchRollupPrior = subsetRollup(grandRollupPrior, PAID_SEARCH);
  const fullSearchRollup = { Meta: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, TikTok: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, Axon: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, Snap: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, ...searchRollup };
  const fullSearchRollupPrior = { Meta: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, TikTok: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, Axon: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, Snap: { spend: 0, revenue: 0, shopifySales: 0, ncOrders: 0 }, ...searchRollupPrior };

  const noData = yesterdayRows.length === 0;

  // Header row heights (px) for sticky positioning
  // row1=25, row2=25, row3=25 => sticky tops: 0, 25, 50
  const H1 = 0, H2 = 25, H3 = 50;

  const thStyle = (top, extra = {}) => ({
    top,
    position: 'sticky',
    ...extra,
  });

  // Shared style for group header cells (spans multiple columns)
  const groupTh = (top, bg = '#e8eaed') => ({
    top,
    position: 'sticky',
    background: bg,
    borderBottom: '2px solid #c0c0c0',
  });

  return (
    <div className="table-scroll-container">
      {noData && (
        <div style={{ padding: '12px 16px', color: '#c5221f', background: '#fce8e6', borderBottom: '1px solid #e0e0e0', fontSize: 13 }}>
          No data found for yesterday. Showing mock/sample data if available, or check your data source.
        </div>
      )}
      <table className="sheets-table">
        <thead>
          {/* === ROW 1: Group Headers === */}
          <tr style={{ height: 25 }}>
            {/* Row # + Client */}
            <th
              className="sticky-col"
              rowSpan={3}
              style={{ ...thStyle(H1), left: 0, zIndex: 5, textAlign: 'left', minWidth: 160, verticalAlign: 'bottom' }}
            >
              Client
            </th>

            {/* Paid Social group */}
            <th colSpan={8} style={groupTh(H1, '#e6f4ea')}>
              Spend — Paid Social
            </th>

            {/* Total Paid Social */}
            <th colSpan={2} style={groupTh(H1, '#ceead6')}>
              Total Paid Social
            </th>

            {/* Paid Search group */}
            <th colSpan={4} style={groupTh(H1, '#e8f0fe')}>
              Spend — Paid Search
            </th>

            {/* Total Paid Search */}
            <th colSpan={2} style={groupTh(H1, '#d2e3fc')}>
              Total Paid Search
            </th>

            {/* Total Spend */}
            <th colSpan={2} style={groupTh(H1, '#f1f3f4')}>
              Total Spend
            </th>

            {/* ROAS */}
            <th colSpan={4} style={groupTh(H1, '#fce8e6')}>
              ROAS (7DC 0DV)
            </th>

            {/* Shopify Sales */}
            <th colSpan={2} style={groupTh(H1, '#fef9e7')}>
              Total Shopify Sales
            </th>

            {/* MER */}
            <th rowSpan={3} style={{ ...thStyle(H1), background: '#f8f9fa', verticalAlign: 'bottom' }}>
              MER
            </th>

            {/* CAC */}
            <th rowSpan={3} style={{ ...thStyle(H1), background: '#f8f9fa', verticalAlign: 'bottom' }}>
              CAC
            </th>
          </tr>

          {/* === ROW 2: Platform Names === */}
          <tr style={{ height: 25 }}>
            {/* Meta */}
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>Meta</th>
            {/* TikTok */}
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>TikTok</th>
            {/* Axon */}
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>Axon</th>
            {/* Snap */}
            <th colSpan={2} style={thStyle(H2, { background: '#e6f4ea' })}>Snap</th>
            {/* Total PS */}
            <th colSpan={2} style={thStyle(H2, { background: '#ceead6' })}>SUM</th>
            {/* Google */}
            <th colSpan={2} style={thStyle(H2, { background: '#e8f0fe' })}>Google</th>
            {/* Bing */}
            <th colSpan={2} style={thStyle(H2, { background: '#e8f0fe' })}>Bing</th>
            {/* Total Search */}
            <th colSpan={2} style={thStyle(H2, { background: '#d2e3fc' })}>SUM</th>
            {/* Total Spend */}
            <th colSpan={2} style={thStyle(H2, { background: '#f1f3f4' })}>SUM</th>
            {/* ROAS platforms */}
            <th style={thStyle(H2, { background: '#fce8e6' })}>Meta</th>
            <th style={thStyle(H2, { background: '#fce8e6' })}>TikTok</th>
            <th style={thStyle(H2, { background: '#fce8e6' })}>Axon</th>
            <th style={thStyle(H2, { background: '#fce8e6' })}>Snap</th>
            {/* Shopify */}
            <th colSpan={2} style={thStyle(H2, { background: '#fef9e7' })}>All Platforms</th>
          </tr>

          {/* === ROW 3: Metric Sub-headers === */}
          <tr style={{ height: 25 }}>
            {/* Meta */}
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* TikTok */}
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* Axon */}
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* Snap */}
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#e6f4ea', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* Total PS */}
            <th style={thStyle(H3, { background: '#ceead6', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#ceead6', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* Google */}
            <th style={thStyle(H3, { background: '#e8f0fe', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#e8f0fe', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* Bing */}
            <th style={thStyle(H3, { background: '#e8f0fe', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#e8f0fe', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* Total Search */}
            <th style={thStyle(H3, { background: '#d2e3fc', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#d2e3fc', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* Total Spend */}
            <th style={thStyle(H3, { background: '#f1f3f4', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#f1f3f4', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
            {/* ROAS */}
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>Meta</th>
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>TikTok</th>
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>Axon</th>
            <th style={thStyle(H3, { background: '#fce8e6', fontWeight: 'normal', fontSize: 11 })}>Snap</th>
            {/* Shopify */}
            <th style={thStyle(H3, { background: '#fef9e7', fontWeight: 'normal', fontSize: 11 })}>Yest.</th>
            <th style={thStyle(H3, { background: '#fef9e7', fontWeight: 'normal', fontSize: 11 })}>DoD%</th>
          </tr>
        </thead>

        <tbody>
          {clientList.map((client, idx) => {
            const todayRows = yesterdayRows.filter((r) => r.client === client);
            const clientPriorRows = priorRows.filter((r) => r.client === client);
            return (
              <ClientRow
                key={client}
                client={client}
                todayRows={todayRows}
                priorRows={clientPriorRows}
                allRows={data}
                rowNum={idx + 1}
              />
            );
          })}

          {/* Rollup rows */}
          <RollupRow
            label="Total Paid Social"
            todayData={fullPsRollup}
            priorData={fullPsRollupPrior}
            rowNum={clientList.length + 1}
          />
          <RollupRow
            label="Total Paid Search"
            todayData={fullSearchRollup}
            priorData={fullSearchRollupPrior}
            rowNum={clientList.length + 2}
          />
          <RollupRow
            label="Grand Total"
            todayData={grandRollup}
            priorData={grandRollupPrior}
            rowNum={clientList.length + 3}
            isGrandTotal
          />
        </tbody>
      </table>
    </div>
  );
}
