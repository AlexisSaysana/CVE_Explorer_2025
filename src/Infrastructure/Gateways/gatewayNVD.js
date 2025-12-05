// Infrastructure/Gateways/gatewayNVD.js
// Responsabilité UNIQUE: Fetch NVD API + retry logic
// Retourne les données brutes NVD, SANS transformation

// Get API key from environment variable (optional)
const getNvdApiKey = () => {
  return import.meta.env.VITE_NVD_API_KEY || null;
};

// Build NVD API URL with optional API key
const buildNvdUrl = (params) => {
  const baseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
  const url = new URL(baseUrl);
  
  // Add all params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Add API key if available (improves rate limits)
  const apiKey = getNvdApiKey();
  if (apiKey) {
    url.searchParams.append('apiKey', apiKey);
  }
  
  return url.toString();
};

async function fetchNVDApi(cveId) {
    const maxRetries = 5;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const url = buildNvdUrl({ cveId });
            
            const response = await fetch(url, { signal: controller.signal });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.vulnerabilities.length === 0) return null;
            
            return data.vulnerabilities[0].cve;
        } catch (error) {
            lastError = error;
            console.warn(`❌ NVD Attempt ${attempt}/${maxRetries} failed:`, error.message);
            
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 500;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`❌ NVD API failed after ${maxRetries} attempts for ${cveId}:`, lastError);
    return null;
}

async function fetchNVDApiKeywordSearch(keyword, pubStartDate, pubEndDate, resultsPerPage = 100) {
    const maxRetries = 5;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const params = {
                keywordSearch: keyword,
                resultsPerPage: resultsPerPage.toString(),
            };
            if (pubStartDate) {
                params.pubStartDate = pubStartDate;
            }
            if (pubEndDate) {
                params.pubEndDate = pubEndDate;
            }
            
            const url = buildNvdUrl(params);
            
            const response = await fetch(url, { signal: controller.signal });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.vulnerabilities || [];
        } catch (error) {
            lastError = error;
            console.warn(`❌ NVD Keyword Search Attempt ${attempt}/${maxRetries} failed:`, error.message);
            
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 500;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`❌ NVD Keyword Search failed after ${maxRetries} attempts:`, lastError);
    return [];
}

export class NvdHttpCveGateway {
    /**
     * Récupère les données NVD brutes (sans transformation).
     * @param {string} cveId 
     * @returns {Promise<object | null>} Données NVD brutes de l'API
     */
    async getRawData(cveId) {
        const cleanId = cveId.trim().toUpperCase();
        return fetchNVDApi(cleanId);
    }

    /**
     * Recherche les CVEs par mot-clé.
     * @param {string} keyword 
     * @param {string} pubStartDate Date de publication minimale (format ISO)
     * @param {string} pubEndDate Date de publication maximale (format ISO)
     * @param {number} resultsPerPage Nombre de résultats
     * @returns {Promise<array>} Liste des CVEs correspondants
     */
    async searchByKeyword(keyword, pubStartDate = null, pubEndDate = null, resultsPerPage = 100) {
        // NVD API limitation: max 120 days range for keyword searches
        // If range > 120 days, split into chunks
        if (pubStartDate && pubEndDate) {
            const start = new Date(pubStartDate);
            const end = new Date(pubEndDate);
            const diffDays = (end - start) / (1000 * 60 * 60 * 24);
            
            // If range is more than 120 days, split into 120-day chunks
            if (diffDays > 120) {
                const chunks = [];
                let currentStart = new Date(start);
                
                while (currentStart < end) {
                    let currentEnd = new Date(currentStart);
                    currentEnd.setDate(currentEnd.getDate() + 120);
                    
                    if (currentEnd > end) {
                        currentEnd = end;
                    }
                    
                    const chunkStartStr = currentStart.toISOString().split('.')[0] + '.000';
                    const chunkEndStr = currentEnd.toISOString().split('.')[0] + '.000';
                    
                    const chunkResults = await fetchNVDApiKeywordSearch(keyword, chunkStartStr, chunkEndStr, resultsPerPage);
                    chunks.push(...chunkResults);
                    
                    // Move to next chunk
                    currentStart.setDate(currentStart.getDate() + 121);
                }
                
                return chunks;
            }
        }
        
        // Normal case: range <= 120 days or no date range
        return fetchNVDApiKeywordSearch(keyword, pubStartDate, pubEndDate, resultsPerPage);
    }
}
