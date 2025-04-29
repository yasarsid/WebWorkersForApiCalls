// app.js - Main entry point that imports and uses other modules
// This file simply re-exports everything from our modular files

// Import from all modules
import { fetchHelloData, makeParallelApiCalls } from './direct-api.js';
import { makeWorkerApiCalls, initializeWorkers } from './worker-api.js';
import { generateResultsHtml, handleApiError } from './ui.js';

// Export all functions (maintaining backward compatibility if needed)
export {
    fetchHelloData,
    makeParallelApiCalls,
    makeWorkerApiCalls,
    initializeWorkers,
    generateResultsHtml,
    handleApiError
};