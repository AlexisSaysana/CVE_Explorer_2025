// Retry utility with exponential backoff and AbortController

export async function retryWithBackoff(
    fetchFn,
    maxRetries = 5,
    timeoutMs = 10000,
    initialDelayMs = 500
) {
    let lastError = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await fetchFn(controller.signal);
                clearTimeout(timeoutId);
                return result;
            } catch (error) {
                lastError = error;
                
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }

                if (attempt === maxRetries) {
                    break;
                }

                const delay = Math.pow(2, attempt - 1) * initialDelayMs;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    } finally {
        clearTimeout(timeoutId);
    }

    throw lastError || new Error('Max retries exceeded');
}
