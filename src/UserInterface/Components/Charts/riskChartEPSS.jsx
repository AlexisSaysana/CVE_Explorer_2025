import React from 'react';
import './riskChartEPSS.css';

export default function EpssRiskChart({ data }) {
  if (!data || data.length === 0) return null;

  // Categorize by EPSS risk
  const categories = {
    'Critical (>0.5)': { count: 0, color: '#dc2626', label: 'Critical risk' },
    'High (0.3-0.5)': { count: 0, color: '#ea580c', label: 'High risk' },
    'Medium (0.1-0.3)': { count: 0, color: '#eab308', label: 'Medium risk' },
    'Low (<0.1)': { count: 0, color: '#22c55e', label: 'Low risk' },
  };

  data.forEach(cve => {
    const epss = Number(cve.epss) || 0;
    if (epss > 0.5) categories['Critical (>0.5)'].count++;
    else if (epss > 0.3) categories['High (0.3-0.5)'].count++;
    else if (epss > 0.1) categories['Medium (0.1-0.3)'].count++;
    else categories['Low (<0.1)'].count++;
  });

  const total = data.length;
  const segments = Object.entries(categories).filter(([, cat]) => cat.count > 0);

  return (
    <div className="epss-chart">
      <h3>⚡ EPSS Exploitation Risk Distribution</h3>
      <div className="donut-container">
        <svg viewBox="0 0 200 200" className="donut-svg">
          {segments.length > 0 ? (
            segments.map((item, idx) => {
              const [label, cat] = item;
              const percentage = (cat.count / total) * 100;
              const circumference = 2 * Math.PI * 45;
              const offset = segments
                .slice(0, idx)
                .reduce((sum, [, c]) => sum + (c.count / total) * circumference, 0);

              return (
                <circle
                  key={label}
                  cx="100"
                  cy="100"
                  r="45"
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="20"
                  strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
            })
          ) : null}
          <text x="100" y="95" textAnchor="middle" dy="0.3em" className="donut-text">
            {total}
          </text>
          <text x="100" y="115" textAnchor="middle" className="donut-label">
            Total CVEs
          </text>
        </svg>
      </div>
      <div className="legend">
        {Object.entries(categories).map(([label, cat]) => (
          <div key={label} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: cat.color }} />
            <span className="legend-text">
              {cat.label}: <strong>{cat.count} CVEs</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
