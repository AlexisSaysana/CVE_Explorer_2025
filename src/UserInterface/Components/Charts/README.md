# Chart Components

Data visualization for threat analysis and analytics.

## Components

### `chartTimeline.jsx`
Timeline visualization of CVE publication dates.

**Features:**
- X-axis: Time progression
- Y-axis: CVE count or severity aggregation
- Hover tooltips with date and counts
- Responsive to screen size

### `chartDonut.jsx`
Donut chart for category distribution.

**Features:**
- Displays proportional segments
- Legend with category names
- Hover tooltips with counts
- Responsive sizing

### `distributionChartCVSS.jsx`
Distribution chart showing CVSS severity breakdown.

**Features:**
- Segments for each CVSS severity level
- Color-coded by severity (green to red)
- Shows count and percentage per level

### `trendChartCVSS.jsx`
Trend line showing CVSS scores over time.

**Features:**
- Line chart tracking average CVSS over time
- Highlights critical periods
- Shows moving average

### `riskChartEPSS.jsx`
EPSS risk distribution visualization.

**Features:**
- Shows exploitation likelihood distribution
- Identifies high-risk CVEs
- Helps prioritize patching

### `indicatorTrend.jsx`
Simple trend indicator component.

**Features:**
- Shows trend direction (up/down)
- Displays percentage change
- Color-coded indicator

## Data Input Format

All charts expect normalized data arrays:
```javascript
[
  { date: '2025-01', count: 42, score: 7.5 },
  { date: '2025-02', count: 38, score: 6.8 }
]
```

## Styling

- Each chart has companion CSS file
- Consistent color scheme across charts
- Responsive to viewport changes
