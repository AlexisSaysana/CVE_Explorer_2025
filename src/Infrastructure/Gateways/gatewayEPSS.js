// Fetches EPSS exploitation probability scores

import { normalizeCveId } from '../../Application/constants/messages.js';

async function fetchEPSS(cveId) {
    try {
        const response = await fetch(`https://api.first.org/data/v1/epss?cve=${cveId}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return {
                score: parseFloat(data.data[0].epss),
                percentile: parseFloat(data.data[0].percentile)
            };
        }
        return null;
    } catch (error) {
        console.warn(`[EPSS Gateway] Failed to fetch: ${error.message}`);
        return null;
    }
}

export class EpssHttpCveGateway {
    async getScore(cveId) {
        const cleanId = normalizeCveId(cveId);
        return fetchEPSS(cleanId);
    }
}