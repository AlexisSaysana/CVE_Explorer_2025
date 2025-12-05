# User Interface Layer

React components and screens for CVE data visualization and interaction.

## Structure

### `Screens/`
Full-page views combining components:
- **screenExplorer.jsx** - Single CVE search and display interface
- **screenThreat.jsx** - Bulk CVE analysis and threat intelligence dashboard

### `Components/`
Reusable UI elements organized by function:
- **Input/** - Data entry components (CVE search, file upload)
- **Display/** - CVE information presentation and layout
- **Cards/** - Summary cards (CVSS, EPSS metrics)
- **Charts/** - Data visualization (trends, distributions, timelines)
- **Alerts/** - Warning and notification components

### `Services/`
UI-layer utility services (not business logic):
- **serviceCache.js** - Session-based caching with TTL
- **serviceFileParser.js** - CVE file upload parsing (.txt, .json)
- **serviceValidationCVE.js** - Input validation for CVE IDs

## Component Patterns

- **Functional Components**: React 19 with hooks
- **CSS Modules**: Each component has companion CSS file
- **Composition**: Screens compose components for features
- **Props-based**: No global state except cache service

## Key Features

- **Real-time Search**: Single CVE lookup with full NVD data
- **Bulk Upload**: Process multiple CVEs from files
- **Threat Dashboard**: Aggregated statistics and risk analysis
- **Visual Analytics**: Trends, distributions, and timeline charts
- **Responsive Design**: Works on desktop and mobile

## Style Organization

- Global styles: `src/index.css`
- Component styles: `ComponentName.css` (co-located)
- BEM naming convention for CSS classes
