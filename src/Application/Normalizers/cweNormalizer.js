// Normalizes CWE data from NVD weaknesses - uses API data dynamically

export function normalizeCweList(weaknesses) {
    if (!weaknesses) return [];
    
    const cweList = (weaknesses || [])
        .flatMap(w => (w.description || []).map(d => ({
            cweId: d.value,
            cweName: d.value ? `${d.value}` : 'Unknown Weakness'
        })))
        .filter(cwe => cwe.cweId && !cwe.cweId.toLowerCase().includes('noinfo') && cwe.cweId !== 'NVD-CWE-Other')
        .slice(0, 5);
    
    return cweList;
}
