# UI Services

UI-layer utility functions (not business logic).

## Services

### `serviceCache.js`
Session-based caching with TTL support.

**Features:**
- In-memory cache for API responses
- Time-To-Live (TTL) expiration (default: 10 minutes)
- Automatic cleanup of expired entries
- Prevents redundant API calls

**API:**
```javascript
cache.get(key) // Returns value or null if expired
cache.set(key, value, ttlMs) // Sets with TTL
cache.clear() // Clears all entries
```

### `serviceFileParser.js`
File parsing utilities for bulk CVE imports.

**Features:**
- Text file parsing (.txt)
- JSON file parsing (.json)
- Line-by-line processing
- Returns array of parsed CVE IDs

**API:**
```javascript
parseTextFile(file) // Returns Promise<string[]>
parseJsonFile(file) // Returns Promise<string[]>
```

### `serviceValidationCVE.js`
CVE ID validation logic for the UI.

**Features:**
- Format validation (CVE-YYYY-XXXXX+)
- Returns validation errors
- Consistent with backend validation

**API:**
```javascript
validateCveId(cveId) // Returns { valid: boolean, error?: string }
validateCveList(cveIds[]) // Returns { valid: CVE[], invalid: string[] }
```

## Usage Notes

- Cache service prevents excessive API calls
- File parser handles errors gracefully
- Validation provides user-friendly error messages
