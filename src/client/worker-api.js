// worker-api.js - Functions for Web Worker communication

/**
 * Worker pool that manages a group of persistent Web Workers
 */
const workerPool = {
    workers: [],
    initialized: false,
    maxWorkers: 5, // Default value, will be updated via setWorkerCount
    
    /**
     * Initialize the worker pool
     */
    init() {
        if (this.initialized) {
            // If already initialized but with a different worker count, reinitialize
            this.terminate();
        }
        
        for (let i = 0; i < this.maxWorkers; i++) {
            const worker = new Worker('./workers/api-worker.js');
            this.workers.push(worker);
        }
        
        this.initialized = true;
    },
    
    /**
     * Terminate all workers and reset the pool
     */
    terminate() {
        if (!this.initialized) return;
        
        // Terminate all workers
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.initialized = false;
    },
    
    /**
     * Set the number of workers in the pool
     * @param {number} count - Number of workers to use
     */
    setWorkerCount(count) {
        // Validate input
        const workerCount = parseInt(count, 10) || 5;
        const validWorkerCount = Math.max(1, Math.min(16, workerCount)); // Limit between 1-16
        
        if (this.maxWorkers !== validWorkerCount) {
            this.maxWorkers = validWorkerCount;
            // If already initialized, reinitialize with new count
            if (this.initialized) {
                this.init();
            }
        }
    },
    
    /**
     * Get a worker by index
     * @param {number} index - The index of the worker to retrieve
     * @returns {Worker} - The requested Web Worker
     */
    getWorker(index) {
        if (index >= this.workers.length) {
            throw new Error(`Worker index ${index} is out of bounds`);
        }
        return this.workers[index];
    },
    
    /**
     * Get total number of workers
     * @returns {number} - The number of workers in the pool
     */
    getWorkerCount() {
        return this.workers.length;
    }
};

/**
 * Function to make API calls using multiple persistent Web Workers
 * @param {number} requestCount - Number of requests to make
 * @returns {Promise<{results: Array, totalProcessingTime: number}>}
 */
function makeWorkerApiCalls(requestCount) {
    return new Promise((resolve, reject) => {
        // Initialize the worker pool if needed
        if (!workerPool.initialized) {
            workerPool.init();
        }
        
        const numWorkers = workerPool.getWorkerCount();
        
        // Calculate requests per worker (distribute them evenly)
        const requestsPerWorker = Math.ceil(requestCount / numWorkers);
        
        // Track completion and results
        let completedWorkers = 0;
        let allResults = [];
        let totalProcessingTime = 0;
        
        // For each worker in the pool, assign work
        for (let i = 0; i < numWorkers; i++) {
            // Calculate how many requests this worker should handle
            const workerRequests = (i === numWorkers - 1) 
                ? Math.max(0, requestCount - (requestsPerWorker * i)) 
                : Math.min(requestsPerWorker, requestCount - (requestsPerWorker * i));
            
            // Skip if no requests for this worker
            if (workerRequests <= 0) {
                completedWorkers++;
                
                // If this was the last worker and no work assigned, resolve
                if (completedWorkers === numWorkers) {
                    resolve({
                        results: allResults,
                        totalProcessingTime: totalProcessingTime
                    });
                }
                continue;
            }
            
            // Get the worker
            const worker = workerPool.getWorker(i);
            
            // Set up a message handler
            const messageHandler = (event) => {
                if (event.data.success) {
                    // Add results from this worker to the combined results
                    allResults = allResults.concat(event.data.results);
                    totalProcessingTime += event.data.totalProcessingTime;
                    
                    // Remove event listener to prevent handling future messages
                    worker.removeEventListener('message', messageHandler);
                    
                    // Track completion
                    completedWorkers++;
                    
                    // If all workers have completed, resolve the main promise
                    if (completedWorkers === numWorkers) {
                        resolve({
                            results: allResults,
                            totalProcessingTime: totalProcessingTime
                        });
                    }
                } else {
                    // Remove event listener on error too
                    worker.removeEventListener('message', messageHandler);
                    worker.removeEventListener('error', errorHandler);
                    reject(new Error(event.data.error));
                }
            };
            
            // Set up error handling
            const errorHandler = (error) => {
                worker.removeEventListener('message', messageHandler);
                worker.removeEventListener('error', errorHandler);
                reject(new Error(`Worker error: ${error.message}`));
            };
            
            // Add event listeners
            worker.addEventListener('message', messageHandler);
            worker.addEventListener('error', errorHandler);
            
            // Send work to the worker
            worker.postMessage({
                type: 'fetchData',
                requestCount: workerRequests
            });
        }
    });
}

/**
 * Initialize the worker pool early for better performance
 * @param {number} [workerCount] - Optional number of workers to initialize
 */
function initializeWorkers(workerCount) {
    if (workerCount !== undefined) {
        workerPool.setWorkerCount(workerCount);
    }
    workerPool.init();
}

// Export functions and objects for use in other files
export { makeWorkerApiCalls, initializeWorkers };