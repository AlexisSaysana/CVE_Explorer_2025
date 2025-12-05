// Application/Normalizers/productsNormalizer.js
// Responsabilité UNIQUE: Parser les CPE et extraire produits affectés

export function normalizeAffectedProducts(configurations) {
    if (!configurations) return [];
    
    const products = [];
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
                        const versionRange = match.versionEndIncluding || match.versionEndExcluding 
                            ? ` (up to ${match.versionEndIncluding || match.versionEndExcluding})`
                            : '';
                        
                        products.push({
                            vendor,
                            product,
                            version: version === '*' ? 'all versions' : version,
                            versionRange,
                            cpe,
                            displayName: `${vendor}:${product}${version !== '*' ? ':' + version : ''}${versionRange}`
                        });
                    }
                }
            });
        });
    });
    
    return products.slice(0, 10);
}
