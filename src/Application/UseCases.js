// Orchestrates CVE analysis by fetching from multiple sources and normalizing data

import { NvdHttpCveGateway } from '../Infrastructure/Gateways/gatewayNVD.js';
import { EpssHttpCveGateway } from '../Infrastructure/Gateways/gatewayEPSS.js';
import { KevHttpCveGateway } from '../Infrastructure/Gateways/gatewayKEV.js';
import { normalizeNvdData } from './Normalizers/nvdNormalizer.js';
import { calculateRisk } from './Services/riskCalculator.js';
import { CVE_NOT_FOUND, INVALID_CVE_FORMAT, CVE_PATTERN, normalizeCveId } from './constants/messages.js';

const nvdGateway = new NvdHttpCveGateway();
const epssGateway = new EpssHttpCveGateway();
const kevGateway = new KevHttpCveGateway();

export function isValidCveCode(cveCode) {
    if (typeof cveCode !== 'string' || cveCode.trim() === '') return false;
    return CVE_PATTERN.test(cveCode.trim());
}

async function analyzeCve(cveId) {
    if (!isValidCveCode(cveId)) {
        throw new Error(INVALID_CVE_FORMAT);
    }

    const cleanId = normalizeCveId(cveId);

    // Fetch data from NVD, EPSS, and KEV in parallel
    const [nvdRaw, epssData, kevData] = await Promise.all([
        nvdGateway.getRawData(cleanId).catch(err => {
            console.error('NVD error:', err);
            return null;
        }),
        epssGateway.getScore(cleanId).catch(() => null),
        kevGateway.getStatus(cleanId).catch(() => null),
    ]);

    if (!nvdRaw) {
        throw new Error(CVE_NOT_FOUND);
    }

    const nvdData = normalizeNvdData(nvdRaw);
    const risk = calculateRisk(nvdData, epssData, !!kevData);

    // Flatten data for UI consumption
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

export const getNvdUrl = (cveId) => `https://nvd.nist.gov/vuln/detail/${cveId}`;

export default analyzeCveUseCase;
