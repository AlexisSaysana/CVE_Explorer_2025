# Input Components

Data entry and user input handling.

## Components

### `CveInput.jsx`
Single CVE ID search input component.

**Features:**
- Text input with real-time validation
- CVE format validation (CVE-YYYY-XXXXX+)
- Search button trigger
- Error state display

**Props:**
- `onSearch(cveId)` - Callback when valid CVE is submitted
- `isLoading` - Disables input during API calls
- `error` - Error message to display

### `readFile.jsx`
Bulk CVE file upload component.

**Features:**
- Accepts `.txt` and `.json` files
- Parses CVE IDs from file content
- Validates CVE format for each ID
- Shows upload progress

**Props:**
- `onFileSelect(cveIds[])` - Callback with parsed CVE IDs
- `error` - Error message to display

## Usage

```jsx
<CveInput onSearch={handleSearch} isLoading={loading} error={error} />
<ReadFile onFileSelect={handleFileSelect} error={fileError} />
```
