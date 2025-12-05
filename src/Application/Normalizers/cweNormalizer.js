// Application/Normalizers/cweNormalizer.js
// Responsabilité UNIQUE: Normaliser les données CWE brutes de NVD

const cweNameMap = {
    'CWE-79': 'Improper Neutralization of Input',
    'CWE-89': 'SQL Injection',
    'CWE-119': 'Buffer Over-read',
};

function getCweName(cweId) {
    return cweNameMap[cweId] || 'Unknown Weakness';
}

export function normalizeCweList(weaknesses) {
    if (!weaknesses) return [];
    
    const cweList = (weaknesses || [])
        .flatMap(w => (w.description || []).map(d => ({ cweId: d.value, cweName: getCweName(d.value) })))
        .filter(cwe => cwe.cweId && !cwe.cweId.toLowerCase().includes('noinfo') && cwe.cweId !== 'NVD-CWE-Other')
        .slice(0, 5);
    
    return cweList;
}
