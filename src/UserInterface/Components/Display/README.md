# Display Components

CVE data presentation and layout.

## Components

### `cveDisplay.jsx`
Individual CVE card display component.

**Features:**
- Displays single CVE summary
- Shows CVSS and severity information
- Links to external references
- Responsive card layout

### `cveDisplayLayout.jsx`
Main CVE detail page layout.

**Features:**
- Full CVE information display
- Related CWE weaknesses with MITRE links
- Affected products list
- Reference links to NVD, MITRE, etc.

### `cveDisplayUtils.js`
Shared utility functions for display logic.

**Exports:**
- `getSeverityColor(cvssScore)` - Returns color based on CVSS severity
- `formatDate(dateString)` - Standardized date formatting
- Other display helpers

## CSS Structure

- **cveDisplay.css** - Card styling and layouts
- **cveDisplayLayout.css** - Detail page structure

## Data Flow

```
Screen Component
    ↓
cveDisplayLayout (main container)
    ├─ CVE metadata and details
    ├─ CVSS information
    ├─ CWE weaknesses
    ├─ Affected products
    └─ Reference links
```
