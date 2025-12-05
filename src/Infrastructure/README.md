# Infrastructure Layer

Data access, external API communication, and utility functions.

## Structure

### `Gateways/`
External API integrations with retry logic and error handling:
- **gatewayNVD.js** - National Vulnerability Database API (full CVE data, keyword search)
- **gatewayEPSS.js** - Exploit Prediction Scoring System (exploitation likelihood)
- **gatewayKEV.js** - CISA Known Exploited Vulnerabilities (active exploitation data)
- **gatewayNVD_KEV.js** - Combines NVD and KEV data for enriched results

### `Utils/`
Reusable infrastructure utilities:
- **retryWithBackoff.js** - Exponential backoff retry mechanism (5 attempts, 10s timeout)

## Gateway Features

- **Automatic Retry**: All gateways use exponential backoff with AbortController
- **Error Handling**: Timeout protection (10 seconds) and circuit breaking
- **Data Enrichment**: Combines multiple sources for comprehensive CVE context
- **Performance**: Session-based caching with TTL support

## API Configuration

External APIs require `NVD_API_KEY` environment variable:
- See `.env.example` and `NVD_API_SETUP.md` for setup instructions

## Error Handling

All gateways throw descriptive errors:
- Network failures → Retried automatically
- API errors → Propagated with context
- Timeouts → Failed after 5 attempts
