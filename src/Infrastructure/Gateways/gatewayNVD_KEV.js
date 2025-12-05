// Deprecated: Use gatewayNVD.js, gatewayEPSS.js, and gatewayKEV.js instead
// This file is kept for reference only

import { normalizeCveId } from '../../Application/constants/messages.js';

/**
 * Récupère les données techniques de l'API NVD.
 * @param {string} cveId - L'ID CVE nettoyé.
 * @returns {Promise<object | null>} Données NVD formatées ou null.
 */
async function fetchNVD(cveId) {
    try {
        const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`);
        const data = await response.json();

        if (data.vulnerabilities.length === 0) return null;

        const item = data.vulnerabilities[0].cve;

        // Extraction des informations, en privilégiant CVSS V3.1
        const cvssMetric = item.metrics?.cvssMetricV31?.[0] || item.metrics?.cvssMetricV30?.[0] || item.metrics?.cvssMetricV2?.[0];

        return {
            description: item.descriptions[0]?.value || "No description available.",
            cvssScore: cvssMetric?.cvssData?.baseScore || "N/A",
            severity: cvssMetric?.cvssData?.baseSeverity || "UNKNOWN",
            // Nous n'utilisons pas les références ou les produits ici pour simplifier l'MVP
        };
    } catch (error) {
        // En cas d'échec de la requête, on relance l'erreur pour que le Use Case puisse la gérer.
        throw new Error(`NVD API error for ${cveId}: ${error.message}`);
    }
}

/**
 * Vérifie si une faille est dans le catalogue CISA KEV.
 * * L'appel KEV est coûteux en temps, il est donc justifié d'avoir sa propre fonction.
 * @param {string} cveId - L'ID CVE nettoyé.
 * @returns {Promise<boolean>} Vrai si la faille est activement exploitée.
 */
async function fetchKEV(cveId) {
    try {
        const response = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
        const data = await response.json();

        // On cherche si notre CVE est dans la liste
        const isExploited = data.vulnerabilities.some(v => v.cveID === cveId);

        return isExploited;
    } catch (error) {
        // En cas d'erreur KEV, on ne bloque pas l'application, on retourne false.
        console.warn(`[KEV Gateway] Warning: Failed to fetch KEV. Assuming not exploited. ${error.message}`);
        return false; 
    }
}

/**
 * La classe de la Gateway NVD/KEV implémente le contrat (Port) implicite.
 */
export class NvdKevHttpCveGateway {
    
    /**
     * Récupère les données techniques et l'état d'exploitation actif.
     * @param {string} cveId 
     * @returns {Promise<object>} Un objet contenant les détails NVD et l'état KEV.
     */
    async getDetails(cveId) {
        const cleanId = normalizeCveId(cveId);
        
        const [nvdData, isKev] = await Promise.all([
            fetchNVD(cleanId),
            fetchKEV(cleanId)
        ]);

        if (!nvdData) {
            return null; // La CVE n'existe pas
        }

        // Retourne un objet propre à l'usage du Use Case
        return {
            ...nvdData, 
            isKev: isKev
        };
    }
}