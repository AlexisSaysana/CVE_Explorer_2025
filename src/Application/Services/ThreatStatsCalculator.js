// Statistical calculations for threat analysis

export function calculateAverages(cves) {
    if (!cves || cves.length === 0) {
        return { avgCvss: '0.0', avgEpss: '0.000' };
    }

    const avgCvss = (cves.reduce((sum, c) => sum + (Number(c.cvss) || 0), 0) / cves.length).toFixed(1);
    const avgEpss = (cves.reduce((sum, c) => sum + (Number(c.epss) || 0), 0) / cves.length).toFixed(3);

    return { avgCvss, avgEpss };
}

// Returns most frequent CWEs
export function getTopCwes(cves, topN = 5) {
    const cweFreq = {};
    
    cves.forEach(c => {
        if (c.cwe && c.cwe !== 'N/A') {
            cweFreq[c.cwe] = (cweFreq[c.cwe] || 0) + 1;
        }
    });

    return Object.entries(cweFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([cwe, count]) => ({ cwe, count }));
}

export function sortByCvss(cves, limit = null) {
    const sorted = [...cves].sort((a, b) => (Number(b.cvss) || 0) - (Number(a.cvss) || 0));
    return limit ? sorted.slice(0, limit) : sorted;
}

export function sortByEpss(cves, limit = null) {
    const sorted = [...cves].sort((a, b) => (Number(b.epss) || 0) - (Number(a.epss) || 0));
    return limit ? sorted.slice(0, limit) : sorted;
}
