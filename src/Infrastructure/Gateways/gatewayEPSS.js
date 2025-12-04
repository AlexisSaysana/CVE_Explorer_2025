// src/infrastructure/gateways/EpssHttpCveGateway.js
// IMPLÉMENTATION CONCRÈTE de l'accès à l'API EPSS

/**
 * Récupère le score de prédiction EPSS.
 * @param {string} cveId - L'ID CVE nettoyé.
 * @returns {Promise<object | null>} Score et percentile EPSS.
 */
async function fetchEPSS(cveId) {
    try {
        const response = await fetch(`https://api.first.org/data/v1/epss?cve=${cveId}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return {
                score: parseFloat(data.data[0].epss), // Convertir en nombre pour le calcul/affichage
                percentile: parseFloat(data.data[0].percentile)
            };
        }
        return null;
    } catch (error) {
        // En cas d'échec de la requête, on log et on retourne null
        console.warn(`[EPSS Gateway] Warning: Failed to fetch EPSS. ${error.message}`);
        return null;
    }
}

/**
 * La classe de la Gateway EPSS implémente le contrat (Port) implicite.
 */
export class EpssHttpCveGateway {
    
    /**
     * Récupère le score EPSS.
     * @param {string} cveId 
     * @returns {Promise<{score: number, percentile: number} | null>}
     */
    async getScore(cveId) {
        const cleanId = cveId.trim().toUpperCase();
        return fetchEPSS(cleanId);
    }
}