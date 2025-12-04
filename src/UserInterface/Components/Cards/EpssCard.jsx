import React from 'react';
import { formatEpssPercent } from '../Display/cveDisplayUtils.js';
import DonutChart from '../Charts/DonutChart.jsx';

export default function EpssCard({ epss }) {
  const score = typeof epss?.score === 'number' ? epss.score : null;
  const percentile = typeof epss?.percentile === 'number' ? epss.percentile : null;
  const label = score === null ? 'EPSS unavailable' : score > 0.7 ? 'High likelihood' : score > 0.3 ? 'Medium' : 'Low';
  const color = '#9c27b0';

  return (
    <div className="cve-score-card epss-card" style={{ borderLeftColor: color }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <DonutChart
          value={score ?? 0}
          max={1}
          size={86}
          stroke={12}
          color={color}
          textColor={color}
          label={formatEpssPercent(score)}
        />
        <div>
          <h3 style={{ margin: 0 }}>EPSS</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{formatEpssPercent(score)}</div>
            <div style={{ color }}>{label}</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            {percentile !== null ? `Percentile: ${(percentile * 100).toFixed(1)}th` : 'Percentile unavailable'}
          </div>
        </div>
      </div>
    </div>
  );
}
