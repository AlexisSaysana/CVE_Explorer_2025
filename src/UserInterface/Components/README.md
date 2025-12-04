# UI Components Map

Quick orientation for the CVE display area:

- `cveDisplay.jsx` — main composition: renders header, description, scores, KEV, CWE, products, references.
- `ScoreCard.jsx` — CVSS card; uses `DonutChart.jsx` for the score ring and `cveDisplayUtils.js` for severity labels/colors.
- `EpssCard.jsx` — EPSS card; formats the probability and (after update) will render a small ring.
- `KEVAlert.jsx` — banner for Known Exploited Vulnerability.
- `cveDisplayUtils.js` — helpers: severity color/label, formatters for CVSS/EPSS values.
- Styles: `cveDisplay.css` for layout/cards; shared card styles are reused by score cards.

Data flow:
- `HomeScreen.jsx` calls the use case, passes `data` into `cveDisplay.jsx`.
- `cveDisplay.jsx` delegates to the cards (`ScoreCard`, `EpssCard`, `KEVAlert`) and lists (CWE, products, references).
