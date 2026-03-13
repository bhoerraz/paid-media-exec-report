export function calcDoD(today, prior) {
  if (prior === null || prior === undefined || prior === 0) return null;
  return (today - prior) / Math.abs(prior);
}

export function calcROAS(revenue, spend) {
  if (!spend || spend === 0) return null;
  return revenue / spend;
}

export function calcMER(shopifySales, totalSpend) {
  if (!totalSpend || totalSpend === 0) return null;
  return shopifySales / totalSpend;
}

export function calcCAC(totalSpend, ncOrders) {
  if (!ncOrders || ncOrders === 0) return null;
  return totalSpend / ncOrders;
}

export function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatCurrencyDecimals(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return (val * 100).toFixed(1) + '%';
}

export function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(val));
}

export function formatROAS(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toFixed(2) + 'x';
}

export function formatMER(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toFixed(2) + 'x';
}
