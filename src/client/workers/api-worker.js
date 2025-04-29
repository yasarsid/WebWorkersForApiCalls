// Web Worker for API calls

// Function to fetch data from the hello API endpoint
async function fetchHelloData() {
    try {
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
    } catch (error) {
        return {
            error: error.message
        };
    }
}

// Event listener for messages from the main thread
self.addEventListener('message', async (event) => {
    if (event.data.type === 'fetchData') {
        const requestCount = event.data.requestCount || 1;
        
        try {
            // Create an array of promises for the requested number of API calls
            const promises = Array(requestCount).fill().map(() => fetchHelloData());
            
            // Wait for all promises to resolve
            const results = await Promise.all(promises);
            
            // Calculate total processing time from all requests
            let totalProcessingTime = 0;
            results.forEach(result => {
                if (result.processingTime) {
                    totalProcessingTime += result.processingTime;
                }
            });
            
            // Send the results back to the main thread
            self.postMessage({
                success: true,
                results: results,
                totalProcessingTime: totalProcessingTime
            });
        } catch (error) {
            self.postMessage({
                success: false,
                error: error.message
            });
        }
    }
});