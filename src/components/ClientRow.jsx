import React, { useState } from 'react';
import { PAID_SOCIAL, PAID_SEARCH } from '../constants/platforms';
import { aggregateByPlatform, getClientHistory } from '../utils/parseSheetData';
import { calcDoD, calcROAS, calcMER, calcCAC, formatCurrency, formatROAS, formatMER } from '../utils/metrics';
import DoDCell from './DoDCell';
import HistoryTable from './HistoryTable';

export default function ClientRow({ client, todayRows, priorRows, allRows, rowNum }) {
  const [expanded, setExpanded] = useState(false);

  const allPlatformKeys = [...PAID_SOCIAL, ...PAID_SEARCH];

  // Aggregate today's data by platform
  const todayByPlatform = aggregateByPlatform(todayRows, allPlatformKeys);
  const priorByPlatform = aggregateByPlatform(priorRows, allPlatformKeys);

  // Spend values today
  const tMeta = todayByPlatform['Meta']?.spend || 0;
  const tTikTok = todayByPlatform['TikTok']?.spend || 0;
  const tAxon = todayByPlatform['Axon']?.spend || 0;
  const tSnap = todayByPlatform['Snap']?.spend || 0;
  const tGoogle = todayByPlatform['Google']?.spend || 0;
  const tBing = todayByPlatform['Bing']?.spend || 0;
  const tPS = tMeta + tTikTok + tAxon + tSnap;
  const tSearch = tGoogle + tBing;
  const tTotal = tPS + tSearch;

  // Spend values prior
  const pMeta = priorByPlatform['Meta']?.spend || 0;
  const pTikTok = priorByPlatform['TikTok']?.spend || 0;
  const pAxon = priorByPlatform['Axon']?.spend || 0;
  const pSnap = priorByPlatform['Snap']?.spend || 0;
  const pGoogle = priorByPlatform['Google']?.spend || 0;
  const pBing = priorByPlatform['Bing']?.spend || 0;
  const pPS = pMeta + pTikTok + pAxon + pSnap;
  const pSearch = pGoogle + pBing;
  const pTotal = pPS + pSearch;

  // DoD calculations
  const dodMeta = calcDoD(tMeta, pMeta);
  const dodTikTok = calcDoD(tTikTok, pTikTok);
  const dodAxon = calcDoD(tAxon, pAxon);
  const dodSnap = calcDoD(tSnap, pSnap);
  const dodGoogle = calcDoD(tGoogle, pGoogle);
  const dodBing = calcDoD(tBing, pBing);
  const dodPS = calcDoD(tPS, pPS);
  const dodSearch = calcDoD(tSearch, pSearch);
  const dodTotal = calcDoD(tTotal, pTotal);

  // ROAS by platform (revenue / spend)
  const roasMeta = calcROAS(todayByPlatform['Meta']?.revenue || 0, tMeta);
  const roasTikTok = calcROAS(todayByPlatform['TikTok']?.revenue || 0, tTikTok);
  const roasAxon = calcROAS(todayByPlatform['Axon']?.revenue || 0, tAxon);
  const roasSnap = calcROAS(todayByPlatform['Snap']?.revenue || 0, tSnap);

  // Shopify Sales (sum across all platforms)
  const tShopify = allPlatformKeys.reduce((acc, p) => acc + (todayByPlatform[p]?.shopifySales || 0), 0);
  const pShopify = allPlatformKeys.reduce((acc, p) => acc + (priorByPlatform[p]?.shopifySales || 0), 0);
  const dodShopify = calcDoD(tShopify, pShopify);

  // NC Orders (for CAC)
  const tNcOrders = allPlatformKeys.reduce((acc, p) => acc + (todayByPlatform[p]?.ncOrders || 0), 0);

  // MER and CAC
  const mer = calcMER(tShopify, tTotal);
  const cac = calcCAC(tTotal, tNcOrders);

  // Get history when expanding
  const history = expanded ? getClientHistory(allRows, client) : [];

  return (
    <>
      <tr>
        {/* Client name with expand button */}
        <td className="sticky-col client-cell">
          <button
            className="expand-btn"
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? 'Collapse' : 'Expand history'}
          >
            {expanded ? '▼' : '▶'}
          </button>
          {client}
        </td>

        {/* Meta Spend + DoD */}
        <td className="num-cell">{formatCurrency(tMeta)}</td>
        <DoDCell value={dodMeta} />

        {/* TikTok */}
        <td className="num-cell">{formatCurrency(tTikTok)}</td>
        <DoDCell value={dodTikTok} />

        {/* Axon */}
        <td className="num-cell">{formatCurrency(tAxon)}</td>
        <DoDCell value={dodAxon} />

        {/* Snap */}
        <td className="num-cell">{formatCurrency(tSnap)}</td>
        <DoDCell value={dodSnap} />

        {/* Total Paid Social */}
        <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(tPS)}</td>
        <DoDCell value={dodPS} />

        {/* Google */}
        <td className="num-cell">{formatCurrency(tGoogle)}</td>
        <DoDCell value={dodGoogle} />

        {/* Bing */}
        <td className="num-cell">{formatCurrency(tBing)}</td>
        <DoDCell value={dodBing} />

        {/* Total Search */}
        <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(tSearch)}</td>
        <DoDCell value={dodSearch} />

        {/* Total Spend */}
        <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tTotal)}</td>
        <DoDCell value={dodTotal} />

        {/* ROAS by platform */}
        <td className="num-cell">{formatROAS(roasMeta)}</td>
        <td className="num-cell">{formatROAS(roasTikTok)}</td>
        <td className="num-cell">{formatROAS(roasAxon)}</td>
        <td className="num-cell">{formatROAS(roasSnap)}</td>

        {/* Shopify Sales */}
        <td className="num-cell" style={{ fontWeight: 600 }}>{formatCurrency(tShopify)}</td>
        <DoDCell value={dodShopify} />

        {/* MER */}
        <td className="num-cell">{formatMER(mer)}</td>

        {/* CAC */}
        <td className="num-cell">{formatCurrency(cac)}</td>
      </tr>

      {/* History expansion */}
      {expanded && <HistoryTable history={history} />}
    </>
  );
}
