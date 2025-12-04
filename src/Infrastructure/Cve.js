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

        // On extrait proprement les infos utiles
        return {
            description: item.descriptions[0]?.value || "Aucune description disponible.",
            // Le score CVSS n'est pas toujours présent (ex: vieilles CVE), on gère le cas
            cvssScore: item.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || "N/A",
            severity: item.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || "UNKNOWN",
            // On récupère les références (liens) pour la doc
            references: item.references?.map(ref => ref.url) || []
        };
    } catch (error) {
        console.error("❌ Erreur NVD:", error);
        return null;
    }
}

// --- 2. Récupération du score de prédiction (EPSS) ---
async function fetchEPSS(cveId) {
    try {
        const response = await fetch(`https://api.first.org/data/v1/epss?cve=${cveId}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            // On retourne le score brut (ex: 0.95) et le percentile
            return {
                score: data.data[0].epss,
                percentile: data.data[0].percentile
            };
        }
        return { score: "N/A", percentile: "N/A" };
    } catch (error) {
        console.error("❌ Erreur EPSS:", error);
        return { score: "N/A", percentile: "N/A" };
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

// 1. On importe la fonction principale
import { getFullCveData } from './apiService.js';

// 2. On l'utilise
async function lancerRecherche() {
    const resultat = await getFullCveData("CVE-2021-44228");
    
    if (resultat.error) {
        console.log("Erreur : " + resultat.error);
    } else {
        console.log("Score CVSS :", resultat.technical.cvssScore);
        console.log("Probabilité EPSS :", resultat.prediction.score);
        console.log("Est exploitée ? :", resultat.activeThreat);
    }
}