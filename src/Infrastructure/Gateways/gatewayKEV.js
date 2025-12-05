// Checks if CVE is in CISA Known Exploited Vulnerabilities catalog

import { normalizeCveId } from '../../Application/constants/messages.js';

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
    async getStatus(cveId) {
        const cleanId = normalizeCveId(cveId);
        return fetchKEVApi(cleanId);
    }
}
