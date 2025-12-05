# Alert Components

Warning and notification messages.

## Components

### `alertKEV.jsx`
Alert component for CISA Known Exploited Vulnerabilities.

**Features:**
- Displays when CVE is in CISA KEV catalog
- Shows exploitation status (active, known exploitation)
- Provides link to CISA KEV for more details
- Visual warning styling (usually red/orange)

**Props:**
- `kev` - KEV object with exploitation data
- `cveId` - CVE ID for linking

## Usage

```jsx
{cveData.kev && <AlertKEV kev={cveData.kev} cveId={cveId} />}
```

## Alert Types

- **Exploitation Alert** - Shows when CVE has active exploitation
- **Link to Resources** - Directs users to CISA KEV details
