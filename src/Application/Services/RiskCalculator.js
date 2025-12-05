// Application/Services/RiskCalculator.js
// Responsabilité UNIQUE: Calculer le score de risque à partir des données normalisées

export function calculateRisk(nvdData, epssData, kevStatus) {
    let score = 0;
    
    // CVSS contribution
    const nvdScore = nvdData?.cvss?.baseScore ?? null;
    if (typeof nvdScore === 'number') score += nvdScore;
    
    // EPSS contribution
    if (epssData && typeof epssData.score === 'number') score += epssData.score * 5;
    
    // KEV contribution
    if (kevStatus) score += 3;
    
    // Normaliser le score final (0-10)
    const normalizedScore = Math.min(10, Math.round((score / 12) * 10));
    
    // Déterminer le niveau de risque
    let level = 'Low';
    if (normalizedScore >= 8) level = 'Critical';
    else if (normalizedScore >= 6) level = 'High';
    else if (normalizedScore >= 4) level = 'Medium';
    
    return {
        score: normalizedScore,
        level,
    };
}
