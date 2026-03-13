import React from 'react';
import { calcDoD, calcROAS, formatCurrency, formatROAS, formatMER } from '../utils/metrics';

import DoDCell from './DoDCell';

export default function RollupRow({ label, todayData, priorData, rowNum, isGrandTotal = false }) {
  const rowClass = isGrandTotal ? 'rollup-row grand-total' : 'rollup-row';

  // Helper: sum a field from a platform-keyed object
  const sum = (obj, keys) => keys.reduce((acc, k) => acc + (obj?.[k] || 0), 0);

  // Today values
  const tMeta = todayData?.Meta?.spend || 0;
  const tTikTok = todayData?.TikTok?.spend || 0;
  const tAxon = todayData?.Axon?.spend || 0;
  const tSnap = todayData?.Snap?.spend || 0;
  const tGoogle = todayData?.Google?.spend || 0;
  const tBing = todayData?.Bing?.spend || 0;
  const tPS = tMeta + tTikTok + tAxon + tSnap;
  const tSearch = tGoogle + tBing;
  const tTotal = tPS + tSearch;

  // Prior values
  const pMeta = priorData?.Meta?.spend || 0;
  const pTikTok = priorData?.TikTok?.spend || 0;
  const pAxon = priorData?.Axon?.spend || 0;
  const pSnap = priorData?.Snap?.spend || 0;
  const pGoogle = priorData?.Google?.spend || 0;
  const pBing = priorData?.Bing?.spend || 0;
  const pPS = pMeta + pTikTok + pAxon + pSnap;
  const pSearch = pGoogle + pBing;
  const pTotal = pPS + pSearch;

  // ROAS by platform
  const roasMeta = todayData?.Meta ? calcROAS(todayData.Meta.revenue, todayData.Meta.spend) : null;
  const roasTikTok = todayData?.TikTok ? calcROAS(todayData.TikTok.revenue, todayData.TikTok.spend) : null;
  const roasAxon = todayData?.Axon ? calcROAS(todayData.Axon.revenue, todayData.Axon.spend) : null;
  const roasSnap = todayData?.Snap ? calcROAS(todayData.Snap.revenue, todayData.Snap.spend) : null;

  // Shopify
  const allPlatforms = ['Meta', 'TikTok', 'Axon', 'Snap', 'Google', 'Bing'];
  const tShopify = allPlatforms.reduce((acc, p) => acc + (todayData?.[p]?.shopifySales || 0), 0);
  const pShopify = allPlatforms.reduce((acc, p) => acc + (priorData?.[p]?.shopifySales || 0), 0);
  const tNcOrders = allPlatforms.reduce((acc, p) => acc + (todayData?.[p]?.ncOrders || 0), 0);

  const tMer = tTotal > 0 ? tShopify / tTotal : null;
  const tCac = tNcOrders > 0 ? tTotal / tNcOrders : null;

  const dodMeta = calcDoD(tMeta, pMeta);
  const dodTikTok = calcDoD(tTikTok, pTikTok);
  const dodAxon = calcDoD(tAxon, pAxon);
  const dodSnap = calcDoD(tSnap, pSnap);
  const dodGoogle = calcDoD(tGoogle, pGoogle);
  const dodBing = calcDoD(tBing, pBing);
  const dodPS = calcDoD(tPS, pPS);
  const dodSearch = calcDoD(tSearch, pSearch);
  const dodTotal = calcDoD(tTotal, pTotal);
  const dodShopify = calcDoD(tShopify, pShopify);

  return (
    <tr className={rowClass}>
      <td className="sticky-col client-cell" style={{ paddingLeft: 8 }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
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
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tPS)}</td>
      <DoDCell value={dodPS} />
      {/* Google */}
      <td className="num-cell">{formatCurrency(tGoogle)}</td>
      <DoDCell value={dodGoogle} />
      {/* Bing */}
      <td className="num-cell">{formatCurrency(tBing)}</td>
      <DoDCell value={dodBing} />
      {/* Total Search */}
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tSearch)}</td>
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
      <td className="num-cell" style={{ fontWeight: 700 }}>{formatCurrency(tShopify)}</td>
      <DoDCell value={dodShopify} />
      {/* MER */}
      <td className="num-cell">{formatMER(tMer)}</td>
      {/* CAC */}
      <td className="num-cell">{formatCurrency(tCac)}</td>
    </tr>
  );
}
