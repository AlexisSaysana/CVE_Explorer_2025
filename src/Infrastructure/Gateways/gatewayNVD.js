// Infrastructure/Gateways/gatewayNVD.js
// Responsabilité UNIQUE: Fetch NVD API + retry logic
// Retourne les données brutes NVD, SANS transformation

async function fetchNVDApi(cveId) {
    const maxRetries = 5;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(
                `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`,
                { signal: controller.signal }
            );
            
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
}
