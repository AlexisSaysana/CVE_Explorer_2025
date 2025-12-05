import React from 'react';
import './TrendIndicator.css';

export default function TrendIndicator({ data }) {
  if (!data) return null;

  const currentCount = data.length;

  return (
    <div className="trend-indicator">
      <h3>📊 Period Comparison</h3>
      <div className="trend-content">
        <div className="trend-stat">
          <div className="stat-label">Current Period</div>
          <div className="stat-value">{currentCount}</div>
          <div className="stat-unit">CVEs</div>
        </div>

        <div className="trend-arrow">
          <div className="arrow neutral">→</div>
        </div>

        <div className="trend-stat">
          <div className="stat-label">Previous Period</div>
          <div className="stat-value">-</div>
          <div className="stat-unit">Not available</div>
        </div>

        <div className="trend-badge neutral">
          Coming soon
        </div>
      </div>
    </div>
  );
}
