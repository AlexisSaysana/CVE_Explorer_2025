import React from 'react';
import './riskChartEPSS.css';

export default function EpssRiskChart({ data }) {
  if (!data || data.length === 0) return null;

  // Bin EPSS scores (0.0-1.0) into 10 equal intervals
  const bins = Array(10).fill(0).map((_, i) => ({
    range: `${(i * 0.1).toFixed(1)}-${((i + 1) * 0.1).toFixed(1)}`,
    min: i * 0.1,
    max: (i + 1) * 0.1,
    count: 0,
    color: `hsl(${120 - i * 12}, 70%, 50%)` // Green to Red gradient
  }));

  // Categorize each CVE into bins
  data.forEach(cve => {
    const epss = Number(cve.epss) || 0;
    const binIndex = Math.min(Math.floor(epss * 10), 9); // Cap at 9 for score of 1.0
    bins[binIndex].count++;
  });

  const total = data.length;
  const segments = bins.filter(bin => bin.count > 0);

  return (
    <div className="epss-chart">
      <h3>⚡ Total Number of CVEs</h3>
      <div className="donut-container">
        <svg viewBox="0 0 200 200" className="donut-svg">
          {segments.length > 0 ? (
            segments.map((bin, idx) => {
              const percentage = (bin.count / total) * 100;
              const circumference = 2 * Math.PI * 45;
              const offset = segments
                .slice(0, idx)
                .reduce((sum, b) => sum + (b.count / total) * circumference, 0);

              return (
                <circle
                  key={bin.range}
                  cx="100"
                  cy="100"
                  r="45"
                  fill="none"
                  stroke={bin.color}
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
    </div>
  );
}
