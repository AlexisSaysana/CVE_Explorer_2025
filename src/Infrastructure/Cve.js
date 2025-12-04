/**
 * SERVICE API - GESTION DES DONNÉES CVE
 * --------------------------------------
 * Ce fichier contient les fonctions pour interroger les 3 sources obligatoires :
 * 1. NVD (NIST) : Pour les détails techniques et le score CVSS.
 * 2. EPSS (First.org) : Pour la probabilité d'exploitation.
 * 3. CISA KEV : Pour savoir si la faille est activement utilisée par des hackers.
 */

// --- 1. Récupération des données techniques (NVD) ---
async function fetchNVD(cveId) {
    try {
        // On appelle l'API officielle du gouvernement US
        const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`);
        const data = await response.json();

        // Si la liste est vide, la CVE n'existe pas
        if (data.vulnerabilities.length === 0) return null;

        const item = data.vulnerabilities[0].cve;

        // Build a normalized CVE object with consistent fields
        const cvss = pickCvss(item.metrics);

        const cweList = (item.weaknesses || []).flatMap(w => (w.description || []).map(d => ({ cweId: d.value, cweName: getCweName(d.value) }))).slice(0,5);

        const affected = extractAffectedProducts(item.configurations);

        return {
            description: item.descriptions?.[0]?.value || "Aucune description disponible.",
            cvss: cvss, // { baseScore, vector, severity, version } or null
            severity: cvss?.severity || 'UNKNOWN',
            published: item.published || item.publishedDate || null,
            lastModified: item.lastModified || item.lastModifiedDate || null,
            cwe: cweList,
            affectedProducts: affected,
            references: item.references?.map(ref => ref.url) || [],
            impact: deriveImpactFromVector(cvss?.vector),
        };
    } catch (error) {
        console.error("❌ Erreur NVD:", error);
        return null;
    }
}

// Helper: pick the best available CVSS metric and normalize it
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

// Very small CWE name mapper to have friendly names
function getCweName(cweId) {
    const map = {
        'CWE-79': 'Improper Neutralization of Input',
        'CWE-89': 'SQL Injection',
        'CWE-119': 'Buffer Over-read',
    };
    return map[cweId] || 'Unknown Weakness';
}

// Parse CPE strings in configurations to get vendor/product/version
function extractAffectedProducts(configurations) {
    if (!configurations) return [];
    const products = new Set();
    configurations.forEach(config => {
        config.nodes?.forEach(node => {
            node.cpeMatch?.forEach(match => {
                const cpe = match.criteria;
                if (cpe) {
                    const parts = cpe.split(':');
                    if (parts.length > 4) {
                        const vendor = parts[3] || '';
                        const product = parts[4] || '';
                        const version = parts[5] || '';
                        products.add(`${vendor}:${product}:${version}`);
                    }
                }
            });
        });
    });
    return Array.from(products).slice(0, 10);
}

// Derive a simple impact/exploitability summary from a CVSS vector string
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

// --- 2. Récupération du score de prédiction (EPSS) ---
async function fetchEPSS(cveId) {
    try {
        const response = await fetch(`https://api.first.org/data/v1/epss?cve=${cveId}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            // On retourne le score brut (ex: 0.95) et le percentile
            return {
                score: parseFloat(data.data[0].epss),
                percentile: parseFloat(data.data[0].percentile),
                date: data.data[0].date
            };
        }
        return null;
    } catch (error) {
        console.error("❌ Erreur EPSS:", error);
        return null;
    }
}

// --- 3. Vérification des exploits actifs (CISA KEV) ---
async function fetchKEV(cveId) {
    try {
        // On charge le catalogue des failles exploitées
        const response = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
        const data = await response.json();

        // On cherche si notre CVE est dans la liste
        const isExploited = data.vulnerabilities.some(v => v.cveID === cveId);

        return isExploited; // Retourne Vrai ou Faux
    } catch (error) {
        console.error("❌ Erreur KEV:", error);
        return false; // Dans le doute, on dit non
    }
}

// =========================================================
// 🚀 FONCTION PRINCIPALE (Celle que tu utiliseras)
// =========================================================

export async function getFullCveData(cveId) {
    // 1. Nettoyage de l'ID (enlève les espaces, met en majuscules)
    const cleanId = cveId.trim().toUpperCase();
    console.log(`🔍 Analyse lancée pour : ${cleanId}`);

    // 2. Appel PARALLÈLE (Promise.all)
    // C'est crucial pour la vitesse : on lance les 3 requêtes en même temps
    // au lieu d'attendre l'une après l'autre.
    const [nvdData, epssData, isKev] = await Promise.all([
        fetchNVD(cleanId),
        fetchEPSS(cleanId),
        fetchKEV(cleanId)
    ]);

    // 3. Si NVD ne renvoie rien, la CVE n'existe probablement pas
    if (!nvdData) {
        return { error: "CVE introuvable ou invalide." };
    }

    // 4. On assemble le paquet final pour ton site
    return {
        id: cleanId,
        technical: nvdData,      // Contient description, score, sévérité
        prediction: epssData,    // Contient le score EPSS
        activeThreat: isKev,     // Contient true/false
        timestamp: new Date().toISOString()
    };
}

// Backwards-compatible named exports expected by the Application layer
export const fetchNvdCve = fetchNVD;
export const fetchEpssCve = fetchEPSS;
export const checkKevCve = fetchKEV;

/**
 * Utility: build a direct NVD URL for a CVE
 */
export const getNvdUrl = (cveId) => `https://nvd.nist.gov/vuln/detail/${cveId}`;