import React from 'react';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatROAS,
  formatMER,
} from '../utils/metrics';

/**
 * type: 'currency' | 'roas' | 'mer' | 'percent' | 'number'
 */
export default function MetricCell({ value, type = 'currency', className = '' }) {
  let formatted;

  switch (type) {
    case 'currency':
      formatted = formatCurrency(value);
      break;
    case 'roas':
      formatted = formatROAS(value);
      break;
    case 'mer':
      formatted = formatMER(value);
      break;
    case 'percent':
      formatted = formatPercent(value);
      break;
    case 'number':
      formatted = formatNumber(value);
      break;
    default:
      formatted = value ?? '—';
  }

  const isEmpty = formatted === '—';

  return (
    <td
      className={`num-cell ${className}`}
      style={{ color: isEmpty ? '#80868b' : undefined }}
    >
      {formatted}
    </td>
  );
}
