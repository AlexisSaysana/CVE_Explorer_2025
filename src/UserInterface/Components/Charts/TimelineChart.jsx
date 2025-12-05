import React from 'react';
import './TimelineChart.css';

export default function TimelineChart({ data }) {
  if (!data || data.length === 0) return null;

  // Group by month
  const months = {};
  data.forEach(cve => {
    if (cve.published) {
      const date = new Date(cve.published);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + 1;
    }
  });

  // Get last 6 months
  const sortedMonths = Object.entries(months)
    .sort()
    .slice(-6)
    .map(([month, count]) => ({
      month,
      count,
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }));

  if (sortedMonths.length === 0) return null;

  const maxCount = Math.max(...sortedMonths.map(m => m.count)) || 1;

  return (
    <div className="timeline-chart">
      <h3>📈 CVE Timeline (Last 6 Months)</h3>
      <div className="timeline-container">
        {sortedMonths.map((item, idx) => (
          <div key={item.month} className="timeline-item">
            <div className="timeline-bar-wrapper">
              <div
                className="timeline-bar"
                style={{
                  height: `${(item.count / maxCount) * 160}px`,
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                }}
              />
            </div>
            <div className="timeline-count">{item.count}</div>
            <div className="timeline-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
