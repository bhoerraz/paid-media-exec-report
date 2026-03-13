import React from 'react';

/**
 * Displays a Day-over-Day percentage change with color and arrow.
 */
export default function DoDCell({ value, className = '' }) {
  if (value === null || value === undefined || isNaN(value)) {
    return <td className={`num-cell dod-neutral ${className}`}>—</td>;
  }

  const pct = (value * 100).toFixed(1);
  const isPositive = value > 0;
  const isNegative = value < 0;

  let cls = 'dod-neutral';
  let arrow = '';
  let display = `${Math.abs(pct)}%`;

  if (isPositive) {
    cls = 'dod-positive';
    arrow = '▲ ';
    display = `▲ ${pct}%`;
  } else if (isNegative) {
    cls = 'dod-negative';
    arrow = '▼ ';
    display = `▼ ${Math.abs(pct)}%`;
  } else {
    display = '0.0%';
  }

  return (
    <td className={`num-cell ${cls} ${className}`} style={{ fontSize: '12px' }}>
      {display}
    </td>
  );
}
