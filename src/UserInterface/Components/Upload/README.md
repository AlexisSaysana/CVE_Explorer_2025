# Upload Components

File handling for bulk CVE imports.

## Components

### `readFile.jsx`
File upload and parsing component.

**Features:**
- File input (accepts .txt, .json)
- Validates file size
- Parses CVE IDs from content
- Validates each CVE ID format
- Shows progress feedback

**Props:**
- `onFileSelect(cveIds[])` - Called with parsed CVE IDs
- `error` - Error message to display
- `disabled` - Disable during processing

## Supported Formats

### Text File (.txt)
One CVE per line:
```
CVE-2025-1234
CVE-2025-5678
CVE-2025-9999
```

### JSON File (.json)
```json
{
  "cves": ["CVE-2025-1234", "CVE-2025-5678"]
}
```

Or simple array:
```json
["CVE-2025-1234", "CVE-2025-5678"]
```

## Usage

```jsx
<ReadFile onFileSelect={handleCveIds} error={uploadError} />
```

## Error Handling

- Invalid file format → Error message
- Unparseable CVEs → Filtered out with warning
- File too large → Rejected
