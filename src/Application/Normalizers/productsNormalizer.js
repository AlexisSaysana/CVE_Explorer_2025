// Application/Normalizers/productsNormalizer.js
// Responsabilité UNIQUE: Parser les CPE et extraire produits affectés

export function normalizeAffectedProducts(configurations) {
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
