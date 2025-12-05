// UserInterface/Services/CveValidator.js
// Responsabilité UNIQUE: Valider et parser les CVE IDs du formulaire

export function parseCveList(cveInput) {
    const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
    
    const cveList = cveInput
        .split(',')
        .map(c => c.trim())
        .filter(c => cvePattern.test(c))
        .map(c => c.toUpperCase());
    
    return cveList;
}

export function isValidCveInput(cveInput) {
    return parseCveList(cveInput).length > 0;
}
