import React from 'react';

function SkeletonCell({ width = 60 }) {
  return (
    <td className="num-cell">
      <span className="skeleton-cell" style={{ width }} />
    </td>
  );
}

function SkeletonHeaderCell({ width = 60 }) {
  return (
    <th>
      <span className="skeleton-cell" style={{ width, height: 10 }} />
    </th>
  );
}

export default function LoadingSkeleton() {
  const rows = 5;
  const cols = 20;

  return (
    <div className="table-scroll-container">
      <table className="sheets-table">
        <thead>
          <tr>
            <th className="sticky-col" style={{ minWidth: 140 }}>
              <span className="skeleton-cell" style={{ width: 80 }} />
            </th>
            {Array.from({ length: cols }).map((_, i) => (
              <SkeletonHeaderCell key={i} width={50 + Math.random() * 30} />
            ))}
          </tr>
          <tr>
            <th className="sticky-col">
              <span className="skeleton-cell" style={{ width: 50 }} />
            </th>
            {Array.from({ length: cols }).map((_, i) => (
              <SkeletonHeaderCell key={i} width={40} />
            ))}
          </tr>
          <tr>
            <th className="sticky-col">
              <span className="skeleton-cell" style={{ width: 40 }} />
            </th>
            {Array.from({ length: cols }).map((_, i) => (
              <SkeletonHeaderCell key={i} width={35} />
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri}>
              <td className="sticky-col client-cell">
                <span className="skeleton-cell" style={{ width: 90 }} />
              </td>
              {Array.from({ length: cols }).map((_, ci) => (
                <SkeletonCell key={ci} width={45 + (ci % 3) * 10} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
