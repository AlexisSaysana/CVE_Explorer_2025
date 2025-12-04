import React from 'react';
import DonutChart from '../Charts/DonutChart.jsx';
import { getSeverityColor, getSeverityLabel } from '../Display/cveDisplayUtils.js';

export default function ScoreCard({ cvss, risk, impact }) {
  const score = cvss?.baseScore ?? null;
  const vector = cvss?.vector ?? null;
  const severity = score !== null ? getSeverityLabel(score) : (cvss?.severity || 'N/A');
  const color = getSeverityColor(score);

  return (
    <div className="cve-score-card scorecard-main" style={{ borderLeftColor: color }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <DonutChart value={score || 0} max={10} size={86} stroke={12} color={color} textColor={color} />
        <div>
          <h3 style={{ margin: 0 }}>CVSS</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{score !== null ? score.toFixed(1) : 'N/A'}</div>
            <div style={{ color }}>{severity}</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{vector || 'Vector unavailable'}</div>
        </div>
      </div>

      {impact && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <span className="badge">Impact: {impact.impact}</span>
          <span className="badge">Exploitability: {impact.exploitability}</span>
        </div>
      )}
    </div>
  );
}
