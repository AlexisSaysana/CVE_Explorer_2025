import React from 'react';

// Simple SVG donut chart. `value` expected in range [0..max]
export default function DonutChart({ value = 0, max = 10, size = 72, stroke = 10, color = '#d32f2f', textColor, label }) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(1, (safeValue / max)));
  const dash = circumference * percent;

  const center = size / 2;
  const gradientId = `donut-${(color || 'color').replace(/[^a-zA-Z0-9]/g, '')}`;
  const labelColor = textColor || color || '#111';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g transform={`translate(${center}, ${center})`}>
        <circle r={radius} fill="none" stroke="#eee" strokeWidth={stroke} />
        <circle
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={-circumference * 0.25}
          transform={`rotate(-90)`}
        />
        <text x="0" y="6" textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: labelColor }}>
          {label ?? (Number.isFinite(value) ? value.toFixed(1) : 'N/A')}
        </text>
      </g>
    </svg>
  );
}
