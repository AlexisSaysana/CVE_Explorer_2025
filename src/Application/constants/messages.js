// Application-level user-facing messages
export const CVE_NOT_FOUND = 'CVE introuvable ou invalide.';
export const INVALID_CVE_FORMAT = 'Identifiant CVE invalide. Format attendu : CVE-YYYY-NNNN.';

// CVE ID validation pattern
export const CVE_PATTERN = /^CVE-\d{4}-\d{4,}$/i;

// Normalize CVE ID to uppercase without spaces
export const normalizeCveId = (cveId) => cveId.trim().toUpperCase();
