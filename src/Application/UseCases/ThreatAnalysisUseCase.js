// Application/UseCases/ThreatAnalysisUseCase.js
// Responsabilité UNIQUE: Orchestrer l'analyse de menaces pour un keyword et une période

import { NvdHttpCveGateway } from '../../Infrastructure/Gateways/gatewayNVD.js';
import { EpssHttpCveGateway } from '../../Infrastructure/Gateways/gatewayEPSS.js';
import { normalizeNvdData } from '../Normalizers/nvdNormalizer.js';
import { calculateAverages, getTopCwes, sortByCvss, sortByEpss } from '../Services/ThreatStatsCalculator.js';

/**
 * Execute threat analysis for a keyword and date range
 * @param {string} keyword - Search keyword
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Analysis results with stats
 */
export async function executeThreatAnalysis(keyword, startDate, endDate) {
    // Initialize gateways
    const nvdGateway = new NvdHttpCveGateway();
    const epssGateway = new EpssHttpCveGateway();

    // Format dates for NVD API (ISO 8601: YYYY-MM-DDTHH:MM:SS.000)
    const pubStartDate = startDate.toISOString().split('.')[0] + '.000';
    const pubEndDate = endDate.toISOString().split('.')[0] + '.000';

    // 1. Fetch CVEs by keyword from NVD with date filtering
    const rawVulnerabilities = await nvdGateway.searchByKeyword(keyword, pubStartDate, pubEndDate, 200);

    if (!rawVulnerabilities || rawVulnerabilities.length === 0) {
        throw new Error(`No CVE found for "${keyword}" in this period.`);
    }

    // 2. Normalize and extract CVSS scores
    const enrichedCves = rawVulnerabilities.map(v => {
        const nvdData = normalizeNvdData(v.cve);
        return {
            id: v.cve.id,
            cvss: nvdData?.cvss?.baseScore || 0,
            description: nvdData?.description || '',
            published: v.cve.published,
            cwe: nvdData?.cwe?.[0]?.cweName || 'N/A',
        };
    });

    // 3. Get top 10 by CVSS for EPSS enrichment
    const topByCvss = sortByCvss(enrichedCves, 10);

    // 4. Fetch EPSS scores in parallel for top 10
    const epssPromises = topByCvss.map(c => 
        epssGateway.getScore(c.id).catch(() => null)
    );
    const epssScores = await Promise.all(epssPromises);

    // 5. Attach EPSS scores to top 10
    const enrichedCvesWithEpss = topByCvss.map((c, idx) => ({
        ...c,
        epss: epssScores[idx]?.score || 0,
    }));

    // 6. Calculate statistics
    const { avgCvss, avgEpss } = calculateAverages(enrichedCvesWithEpss);
    const topCwes = getTopCwes(enrichedCves, 5);

    // 7. Build summary object
    return {
        topCvss: enrichedCvesWithEpss,
        topEpss: sortByEpss(enrichedCvesWithEpss),
        avgCvss,
        avgEpss,
        topCwes,
        kevCount: 0, // KEV not implemented for bulk yet
        totalCves: rawVulnerabilities.length,
        allCves: enrichedCves, // For charts
    };
}

export const ThreatAnalysisUseCase = {
    execute: executeThreatAnalysis,
};

export default ThreatAnalysisUseCase;
