// direct-api.js - Functions for direct API calls

// Helper function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Function to fetch data from the hello API endpoint
 * @returns {Promise<{data: Object, processingTime: number}>}
 */
async function fetchHelloData() {
    // Measure processing time
    const response = await fetch('http://localhost:3000/api/hello');
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    const processingStartTime = performance.now();

    // Add a 100ms processing delay
    while (processingStartTime + 100 > performance.now()) {
    }
    
    // Calculate processing time
    const processingTime = performance.now() - processingStartTime;
    
    return {
        data: result,
        processingTime: processingTime
    };
}

/**
 * Function to make multiple API calls in parallel
 * @param {number} requestCount - Number of requests to make
 * @returns {Promise<{results: Array, totalProcessingTime: number}>}
 */
async function makeParallelApiCalls(requestCount) {
    // Create an array of promises for the requested number of API calls
    const promises = Array(requestCount).fill().map(() => fetchHelloData());
    
    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    
    // Calculate total processing time from all requests
    let totalProcessingTime = 0;
    results.forEach(result => {
        totalProcessingTime += result.processingTime;
    });
    
    return {
        results,
        totalProcessingTime
    };
}

// Export functions for use in other files
export { fetchHelloData, makeParallelApiCalls };