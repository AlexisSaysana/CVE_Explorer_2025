// UserInterface/Services/FileParser.js
// Responsabilité UNIQUE: Parser les fichiers CVE et extraire les IDs

const CVE_PATTERN = /CVE-\d{4}-\d{4,}/i;

export function extractCvesFromRows(rows) {
    const foundCves = new Set();
    
    rows.forEach((row) => {
        row.forEach((cell) => {
            const match = cell.match(CVE_PATTERN);
            if (match) {
                foundCves.add(match[0].toUpperCase());
            }
        });
    });
    
    return Array.from(foundCves);
}
