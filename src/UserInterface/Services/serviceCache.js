// SessionStorage cache with TTL support

const CACHE_PREFIX = 'cve_cache_';

// Stores data with expiration time
export function setCache(key, value, ttlSeconds) {
    try {
        const expiry = Date.now() + (ttlSeconds * 1000);
        const cacheData = { value, expiry };
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Cache write failed:', error);
    }
}

// Returns cached data if still valid, null otherwise
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

export function clearCache() {
    try {
        Object.keys(sessionStorage)
            .filter(key => key.startsWith(CACHE_PREFIX))
            .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
        console.warn('Cache clear failed:', error);
    }
}
