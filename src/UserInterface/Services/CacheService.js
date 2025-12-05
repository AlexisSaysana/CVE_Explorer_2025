// UserInterface/Services/CacheService.js
// Responsabilité UNIQUE: Gérer le cache sessionStorage

const CACHE_PREFIX = 'cve_cache_';

/**
 * Store data in cache with TTL (Time To Live)
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds
 */
export function setCache(key, value, ttlSeconds) {
    try {
        const expiry = Date.now() + (ttlSeconds * 1000);
        const cacheData = { value, expiry };
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Cache write failed:', error);
    }
}

/**
 * Get data from cache if not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/missing
 */
export function getCache(key) {
    try {
        const cached = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;

        const { value, expiry } = JSON.parse(cached);
        if (Date.now() > expiry) {
            sessionStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }

        return value;
    } catch (error) {
        console.warn('Cache read failed:', error);
        return null;
    }
}

/**
 * Clear all cache entries
 */
export function clearCache() {
    try {
        Object.keys(sessionStorage)
            .filter(key => key.startsWith(CACHE_PREFIX))
            .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
        console.warn('Cache clear failed:', error);
    }
}
