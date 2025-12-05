import React from 'react';
import './CvssDistributionChart.css';

export default function CvssDistributionChart({ data }) {
  if (!data || data.length === 0) return null;

  // Create CVSS buckets: 0-3, 4-6, 7-8, 9-10
  const buckets = {
    'Low (0-3)': { count: 0, color: '#10b981' },
    'Medium (4-6)': { count: 0, color: '#f59e0b' },
    'High (7-8)': { count: 0, color: '#f97316' },
    'Critical (9-10)': { count: 0, color: '#dc2626' },
  };

  data.forEach(cve => {
    const score = Number(cve.cvss) || 0;
    if (score < 4) buckets['Low (0-3)'].count++;
    else if (score < 7) buckets['Medium (4-6)'].count++;
    else if (score < 9) buckets['High (7-8)'].count++;
    else buckets['Critical (9-10)'].count++;
  });

  const maxCount = Math.max(...Object.values(buckets).map(b => b.count)) || 1;

  return (
    <div className="cvss-chart">
      <h3>📊 CVSS Distribution</h3>
      <div className="bars-container">
        {Object.entries(buckets).map(([label, bucket]) => {
          const heightPx = (bucket.count / maxCount) * 160;
          return (
            <div key={label} className="bar-item">
              <div className="bar-label">{label}</div>
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    height: `${heightPx}px`,
                    background: `linear-gradient(135deg, ${bucket.color} 0%, ${bucket.color}dd 100%)`,
                  }}
                />
              </div>
              <div className="bar-value">{bucket.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
