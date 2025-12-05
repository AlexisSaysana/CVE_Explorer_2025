// Fetches data from NVD API with retry logic and optional API key support

import { retryWithBackoff } from '../Utils/retryWithBackoff.js';

const getNvdApiKey = () => {
  return import.meta.env.VITE_NVD_API_KEY || null;
};

const buildNvdUrl = (params) => {
  const baseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Attach API key if available for better rate limits
  const apiKey = getNvdApiKey();
  if (apiKey) {
    url.searchParams.append('apiKey', apiKey);
  }
  
  return url.toString();
};

async function fetchNVDApi(cveId) {
    try {
        return await retryWithBackoff(async (signal) => {
            const url = buildNvdUrl({ cveId });
            const response = await fetch(url, { signal });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.vulnerabilities.length === 0) return null;
            
            return data.vulnerabilities[0].cve;
        });
    } catch (error) {
        console.error(`❌ NVD API failed for ${cveId}:`, error.message);
        return null;
    }
}

async function fetchNVDApiKeywordSearch(keyword, pubStartDate, pubEndDate, resultsPerPage = 100) {
    try {
        return await retryWithBackoff(async (signal) => {
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
            const response = await fetch(url, { signal });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.vulnerabilities || [];
        });
    } catch (error) {
        console.error('❌ NVD Keyword Search failed:', error.message);
        return [];
    }
}

export class NvdHttpCveGateway {
    async getRawData(cveId) {
        return fetchNVDApi(cveId);
    }

    // Searches CVEs by keyword with automatic chunking for date ranges > 120 days
    async searchByKeyword(keyword, pubStartDate = null, pubEndDate = null, resultsPerPage = 100) {
        // NVD API has 120-day limit for keyword searches, split into chunks if needed
        if (pubStartDate && pubEndDate) {
            const start = new Date(pubStartDate);
            const end = new Date(pubEndDate);
            const diffDays = (end - start) / (1000 * 60 * 60 * 24);
            
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
                    
                    currentStart.setDate(currentStart.getDate() + 121);
                }
                
                return chunks;
            }
        }
        
        return fetchNVDApiKeywordSearch(keyword, pubStartDate, pubEndDate, resultsPerPage);
    }
}
