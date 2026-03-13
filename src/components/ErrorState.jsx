import React from 'react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="table-scroll-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '48px', color: '#c5221f' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
          Unable to load sheet data
        </div>
        <div style={{ color: '#5f6368', marginBottom: 16, maxWidth: 400 }}>
          {message || 'Check your API key and Sheet ID in your .env file, and ensure the sheet is publicly accessible.'}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: '#1a73e8',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
