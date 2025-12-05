// Calculates overall risk score from CVSS, EPSS, and KEV status

export function calculateRisk(nvdData, epssData, kevStatus) {
    let score = 0;
    
    const nvdScore = nvdData?.cvss?.baseScore ?? null;
    if (typeof nvdScore === 'number') score += nvdScore;
    
    if (epssData && typeof epssData.score === 'number') score += epssData.score * 5;
    
    if (kevStatus) score += 3;
    
    // Normalize to 0-10 scale
    const normalizedScore = Math.min(10, Math.round((score / 12) * 10));
    
    let level = 'Low';
    if (normalizedScore >= 8) level = 'Critical';
    else if (normalizedScore >= 6) level = 'High';
    else if (normalizedScore >= 4) level = 'Medium';
    
    return {
        score: normalizedScore,
        level,
    };
}
