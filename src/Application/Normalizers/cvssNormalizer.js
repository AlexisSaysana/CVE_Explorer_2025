// Application/Normalizers/cvssNormalizer.js
// Responsabilité UNIQUE: Normaliser les données CVSS brutes de NVD

function pickCvss(metrics) {
    if (!metrics) return null;
    const m31 = metrics.cvssMetricV31?.[0];
    const m30 = metrics.cvssMetricV30?.[0];
    const m2  = metrics.cvssMetricV2?.[0];
    const chosen = m31 || m30 || m2;
    if (!chosen) return null;
    const data = chosen.cvssData || chosen.cvss || null;
    if (!data) return null;
    const baseScore = Number(data.baseScore ?? NaN);
    return {
        baseScore: Number.isFinite(baseScore) ? baseScore : null,
        vector: data.vectorString || data.vector || null,
        severity: data.baseSeverity || null,
        version: m31 ? '3.1' : (m30 ? '3.0' : '2.0'),
    };
}

function deriveImpactFromVector(vector) {
    if (!vector) return { impact: 'Unknown', exploitability: 'Unknown' };
    const parts = vector.split('/').slice(1).map(p => p.split(':'));
    const map = {};
    parts.forEach(([k, v]) => { map[k] = v; });
    const impactScore = ['C','I','A'].reduce((sum, k) => sum + (map[k] === 'H' ? 1 : (map[k] === 'L' ? 0.5 : 0)), 0);
    const impact = impactScore >= 2.5 ? 'High' : (impactScore >= 1.5 ? 'Medium' : 'Low');
    const exploitability = map['AV'] === 'N' ? 'High' : (map['AV'] === 'A' ? 'Low' : 'Medium');
    return { impact, exploitability };
}

export function normalizeCvss(metrics) {
    const cvss = pickCvss(metrics);
    if (!cvss) return null;
    
    return {
        baseScore: cvss.baseScore,
        vector: cvss.vector,
        severity: cvss.severity,
        version: cvss.version,
        impact: deriveImpactFromVector(cvss.vector),
    };
}
