# Card Components

Metric summary cards displaying key CVE information.

## Components

### `cardCVSS.jsx`
CVSS score display card.

**Features:**
- Displays CVSS version and score
- Shows severity level with color coding
- Displays attack vector and complexity
- Links to NVD for full details

**Props:**
- `cvss` - CVSS object with score, severity, version
- `cveId` - CVE ID for linking

### `cardEPSS.jsx`
EPSS (Exploit Prediction Scoring System) score card.

**Features:**
- Shows exploitation probability (0-1 scale)
- Displays percentile rank among CVEs
- Shows advisory/related exploit references
- Color-coded risk indicator

**Props:**
- `epss` - EPSS object with score, percentile, references
- `cveId` - CVE ID for linking

## Usage

```jsx
<CardCVSS cvss={cveData.cvss} cveId={cveId} />
<CardEPSS epss={cveData.epss} cveId={cveId} />
```

## Styling

- Responsive grid layout
- Color-coded severity/risk indicators
- Hover effects for interactivity
