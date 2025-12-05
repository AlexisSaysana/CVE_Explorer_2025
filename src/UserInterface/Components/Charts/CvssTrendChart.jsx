import React, { useState } from 'react';
import './CvssTrendChart.css';

export default function CvssTrendChart({ data }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) return null;

  // Group by month and calculate average CVSS
  const months = {};
  data.forEach(cve => {
    if (cve.published && cve.cvss) {
      const date = new Date(cve.published);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, count: 0 };
      }
      months[monthKey].total += Number(cve.cvss) || 0;
      months[monthKey].count += 1;
    }
  });

  // Get last 6 months with average CVSS
  const sortedMonths = Object.entries(months)
    .sort()
    .slice(-6)
    .map(([month, stats]) => ({
      month,
      avgCvss: stats.count > 0 ? (stats.total / stats.count) : 0,
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }));

  if (sortedMonths.length === 0) return null;

  const maxCvss = 10; // CVSS max is always 10
  const minCvss = 0;
  const range = maxCvss - minCvss;

  // Calculate points for the line chart
  const width = 500;
  const height = 150;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 10;
  const stepX = (width - paddingLeft - paddingRight) / (sortedMonths.length - 1 || 1);

  const points = sortedMonths.map((item, idx) => {
    const x = paddingLeft + idx * stepX;
    const y = paddingTop + ((maxCvss - item.avgCvss) / range) * (height - paddingTop - paddingBottom);
    return { x, y, value: item.avgCvss, label: item.label, month: item.month };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="cvss-trend-chart">
      <h3>📈 CVSS Score Trend</h3>
      <div className="trend-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg">
          {/* Y-axis line */}
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#d1d5db" strokeWidth="2" />
          
          {/* X-axis line */}
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#d1d5db" strokeWidth="2" />
          
          {/* Y-axis labels */}
          <text x={paddingLeft - 8} y={paddingTop + 5} textAnchor="end" fontSize="10" fill="#6b7280" fontWeight="500">10</text>
          <text x={paddingLeft - 8} y={paddingTop + (height - paddingTop - paddingBottom) / 2 + 5} textAnchor="end" fontSize="10" fill="#6b7280" fontWeight="500">5</text>
          <text x={paddingLeft - 8} y={height - paddingBottom + 5} textAnchor="end" fontSize="10" fill="#6b7280" fontWeight="500">0</text>
          
          {/* Horizontal grid lines */}
          <line x1={paddingLeft} y1={paddingTop + (height - paddingTop - paddingBottom) / 2} x2={width - paddingRight} y2={paddingTop + (height - paddingTop - paddingBottom) / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          
          {/* Gradient area under line */}
          <defs>
            <linearGradient id="cvssGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`}
            fill="url(#cvssGradient)"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#8b5cf6"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {hoveredPoint === idx && (
                <g>
                  <rect
                    x={p.x - 35}
                    y={p.y < 40 ? p.y + 10 : p.y - 35}
                    width="70"
                    height="28"
                    fill="white"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    rx="4"
                  />
                  <text
                    x={p.x}
                    y={p.y < 40 ? p.y + 23 : p.y - 23}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {p.label}
                  </text>
                  <text
                    x={p.x}
                    y={p.y < 40 ? p.y + 35 : p.y - 11}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#8b5cf6"
                    fontWeight="700"
                  >
                    {p.value.toFixed(1)}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
        
        <div className="trend-labels">
          {sortedMonths.map((item, idx) => (
            <div key={item.month} className="trend-month">
              <div className="month-label">{item.label}</div>
              <div className="month-value">{item.avgCvss.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
