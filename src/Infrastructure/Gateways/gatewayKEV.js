// Infrastructure/Gateways/gatewayKEV.js
// Responsabilité UNIQUE: Vérifier si une CVE est dans CISA KEV

async function fetchKEVApi(cveId) {
    try {
        const response = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
        const data = await response.json();
        const found = data.vulnerabilities.find(v => v.cveID === cveId);
        return found || null;
    } catch (error) {
        console.warn(`[KEV Gateway] Warning: Failed to fetch KEV. ${error.message}`);
        return null;
    }
}

export class KevHttpCveGateway {
    /**
     * Récupère le statut KEV pour une CVE.
     * @param {string} cveId 
     * @returns {Promise<object | null>} Objet KEV (si exploité) ou null
     */
    async getStatus(cveId) {
        const cleanId = cveId.trim().toUpperCase();
        return fetchKEVApi(cleanId);
    }
}
