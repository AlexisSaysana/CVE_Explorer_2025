// Application/UseCases.js
// Responsabilité UNIQUE: Orchestrer les gateways, normalizers et services pour l'analyse CVE

import { NvdHttpCveGateway } from '../Infrastructure/Gateways/gatewayNVD.js';
import { EpssHttpCveGateway } from '../Infrastructure/Gateways/gatewayEPSS.js';
import { KevHttpCveGateway } from '../Infrastructure/Gateways/gatewayKEV.js';
import { normalizeNvdData } from './Normalizers/nvdNormalizer.js';
import { calculateRisk } from './Services/RiskCalculator.js';
import { CVE_NOT_FOUND, INVALID_CVE_FORMAT } from './constants/messages.js';

// Instantiate gateways
const nvdGateway = new NvdHttpCveGateway();
const epssGateway = new EpssHttpCveGateway();
const kevGateway = new KevHttpCveGateway();

export function isValidCveCode(cveCode) {
    if (typeof cveCode !== 'string' || cveCode.trim() === '') return false;
    const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
    return cvePattern.test(cveCode.trim());
}

async function analyzeCve(cveId) {
    if (!isValidCveCode(cveId)) {
        throw new Error(INVALID_CVE_FORMAT);
    }

    const cleanId = cveId.trim().toUpperCase();

    // Fetch from all 3 sources in parallel
    const [nvdRaw, epssData, kevData] = await Promise.all([
        nvdGateway.getRawData(cleanId).catch(err => {
            console.error('NVD error:', err);
            return null;
        }),
        epssGateway.getScore(cleanId).catch(() => null),
        kevGateway.getStatus(cleanId).catch(() => null),
    ]);

    // If NVD doesn't return anything, CVE doesn't exist
    if (!nvdRaw) {
        throw new Error(CVE_NOT_FOUND);
    }

    // Normalize NVD data
    const nvdData = normalizeNvdData(nvdRaw);

    // Calculate risk score
    const risk = calculateRisk(nvdData, epssData, !!kevData);

    // Build the final flattened view model for UI
    const flattened = {
        id: cleanId,
        description: nvdData?.description || null,
        published: nvdData?.published || null,
        cvssScore: nvdData?.cvss || null,
        epssScore: epssData?.score ?? null,
        epss: epssData || null,
        cwe: nvdData?.cwe || [],
        affectedProducts: nvdData?.affectedProducts || [],
        references: nvdData?.references || [],
        kev: kevData ? { exploited: true, ...kevData } : null,
        urls: { nvd: getNvdUrl(cleanId) },
        risk,
        impact: nvdData?.impact || null,
    };

    return flattened;
}

export const analyzeCveUseCase = {
    execute: analyzeCve,
};

/**
 * Utility: build a direct NVD URL for a CVE
 */
export const getNvdUrl = (cveId) => `https://nvd.nist.gov/vuln/detail/${cveId}`;

export default analyzeCveUseCase;
