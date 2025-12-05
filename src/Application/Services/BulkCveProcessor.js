// Processes multiple CVEs concurrently with controlled parallelism

export async function processBulkCves(cveArray, useCase, concurrency = 5) {
    const results = new Array(cveArray.length);
    let cursor = 0;

    const worker = async () => {
        while (true) {
            const myIndex = cursor++;
            if (myIndex >= cveArray.length) break;
            const cveId = cveArray[myIndex];
            try {
                const data = await useCase.execute(cveId);
                results[myIndex] = { cveId, data, error: null };
            } catch (err) {
                results[myIndex] = { cveId, data: null, error: err.message };
            }
        }
    };

    const workers = Array.from(
        { length: Math.min(concurrency, cveArray.length) },
        () => worker()
    );
    
    await Promise.all(workers);
    return results;
}
