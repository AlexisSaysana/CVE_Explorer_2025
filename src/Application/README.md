# Application Layer

Core business logic and use cases for CVE data processing and analysis.

## Structure

### `UseCases/`
High-level operations that orchestrate multiple services:
- **ThreatAnalysisUseCase.js** - Analyzes threat data from CVE, EPSS, and KEV sources

### `Services/`
Domain-specific business logic:
- **bulkCveProcessor.js** - Processes multiple CVEs in batch mode
- **riskCalculator.js** - Calculates risk scores based on CVSS, EPSS, and exploitation status
- **threatStatsCalculator.js** - Aggregates threat statistics (counts, distributions, trends)

### `Normalizers/`
Data transformation and standardization:
- **nvdNormalizer.js** - Normalizes NVD API responses
- **cvssNormalizer.js** - Standardizes CVSS score data
- **cweNormalizer.js** - Processes Common Weakness Enumeration data
- **productsNormalizer.js** - Normalizes affected product information

### `constants/`
Shared application constants:
- **messages.js** - CVE patterns, validation messages, and centralized utilities

## Data Flow

```
UserInterface → UseCases → Services → Normalizers → Infrastructure Gateways
```

## Key Patterns

- **Single Responsibility**: Each service handles one concern
- **Centralized Constants**: CVE_PATTERN and normalizeCveId() centralized
- **No UI Logic**: All components are pure business logic
