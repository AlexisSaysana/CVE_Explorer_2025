// Application/Normalizers/nvdNormalizer.js
// Responsabilité UNIQUE: Transformer les données NVD brutes en objet métier

import { normalizeCvss } from './cvssNormalizer.js';
import { normalizeCweList } from './cweNormalizer.js';
import { normalizeAffectedProducts } from './productsNormalizer.js';

export function normalizeNvdData(nvdRawData) {
    if (!nvdRawData) return null;
    
    const item = nvdRawData;
    const cvss = normalizeCvss(item.metrics);
    const cweList = normalizeCweList(item.weaknesses);
    const affected = normalizeAffectedProducts(item.configurations);
    
    return {
        description: item.descriptions?.[0]?.value || "Aucune description disponible.",
        cvss: cvss,
        severity: cvss?.severity || 'UNKNOWN',
        published: item.published || item.publishedDate || null,
        lastModified: item.lastModified || item.lastModifiedDate || null,
        cwe: cweList,
        affectedProducts: affected,
        references: item.references?.map(ref => ref.url) || [],
        impact: cvss?.impact || null,
    };
}
