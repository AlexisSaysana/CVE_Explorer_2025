// Validates and parses CVE IDs from user input

import { CVE_PATTERN } from '../../Application/constants/messages.js';

export function parseCveList(cveInput) {
    const cveList = cveInput
        .split(',')
        .map(c => c.trim())
        .filter(c => CVE_PATTERN.test(c))
        .map(c => c.toUpperCase());
    
    return cveList;
}

export function isValidCveInput(cveInput) {
    return parseCveList(cveInput).length > 0;
}
