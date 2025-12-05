# UI Components

Reusable React components organized by function. All are functional components using React 19 hooks.

## Directory Structure

```
Components/
├── Input/           # Data entry
├── Display/         # CVE information presentation
├── Cards/           # Summary metric cards
├── Charts/          # Data visualization
├── Alerts/          # Notifications and warnings
└── Upload/          # Bulk import handling
```

## Data Flow

```
Screen Component (screenExplorer.jsx or screenThreat.jsx)
    ↓
Use Case (ThreatAnalysisUseCase.js)
    ↓
Display Layout (cveDisplayLayout.jsx)
    ├─ Card Components (cardCVSS.jsx, cardEPSS.jsx)
    ├─ Alert Components (alertKEV.jsx)
    ├─ Chart Components (chartDonut.jsx, trendChartCVSS.jsx, etc.)
    └─ Reference Lists
```

## Component Categories

### **Input/** - User Data Entry
- `CveInput.jsx` - Single CVE search input
- `readFile.jsx` - Bulk CVE file upload

### **Display/** - CVE Information
- `cveDisplayLayout.jsx` - Main CVE detail layout
- `cveDisplay.jsx` - Individual CVE card
- `cveDisplayUtils.js` - Shared helpers (colors, formatting)

### **Cards/** - Metric Summary
- `cardCVSS.jsx` - CVSS score and severity
- `cardEPSS.jsx` - EPSS exploitation risk

### **Charts/** - Data Visualization
- `chartTimeline.jsx` - CVE publication timeline
- `chartDonut.jsx` - Category distribution
- `distributionChartCVSS.jsx` - CVSS severity breakdown
- `trendChartCVSS.jsx` - CVSS trend over time
- `riskChartEPSS.jsx` - EPSS risk distribution
- `indicatorTrend.jsx` - Simple trend indicator

### **Alerts/** - Notifications
- `alertKEV.jsx` - CISA Known Exploited Vulnerabilities warning

### **Upload/** - File Processing
- `readFile.jsx` - File upload and CVE parsing

## Styling Convention

- Global styles: `src/index.css`
- Component styles: `ComponentName.css` (co-located with component)
- BEM naming for CSS classes
- Responsive design for mobile and desktop

## Key Patterns

- **Props-driven**: All data passed via props
- **No side effects**: Pure component logic where possible
- **Error boundaries**: Each screen handles its own error states
- **Loading states**: Consistent feedback during API calls
