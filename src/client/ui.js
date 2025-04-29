// ui.js - Functions for UI updates and interaction

// Import functions from other modules
import { makeParallelApiCalls } from './direct-api.js';
import { makeWorkerApiCalls, initializeWorkers } from './worker-api.js';

/**
 * Function to generate HTML from API results
 * @param {Array} results - Array of API call results
 * @returns {string} - Generated HTML
 */
function generateResultsHtml(results) {
    let html = `
        <h3>Results of ${results.length} Parallel Requests:</h3>
    `;
    
    html += '<div class="response-container">';
    
    results.forEach((result, index) => {
        html += `
            <div class="response-item">
                <h4>Request #${index + 1} (Processing time: ${result.processingTime.toFixed(2)}ms)</h4>
                <pre>${JSON.stringify(result.data, null, 2)}</pre>
            </div>
        `;
    });
    
    html += '</div>';
    
    return html;
}

/**
 * Function to handle API errors
 * @param {Error} error - The error that occurred
 * @returns {string} - Error HTML
 */
function handleApiError(error) {
    return `
        <h3>Error:</h3>
        <p>${error.message}</p>
        <p>Make sure the server is running on http://localhost:3000</p>
    `;
}

/**
 * Get the number of workers from the input field
 * @returns {number} - Number of workers
 */
function getWorkerCount() {
    return parseInt(document.getElementById('workerCount').value, 10) || 5;
}

/**
 * Handles API requests whether direct or via worker
 * @param {string} apiType - Type of API call ('direct' or 'worker')
 * @param {number} requestCount - Number of requests to make
 * @returns {Promise<Object>} - Object containing results and timing information
 */
async function handleApiRequest(apiType, requestCount, displayResults = true) {
    try {
        const resultDiv = document.getElementById('result');
        const timingStats = document.getElementById('timing-stats');
        const endToEndTimeSpan = document.getElementById('end-to-end-time');
        
        // Validate and limit the number of requests
        if (requestCount > 50) {
            alert('Please limit the number of requests to 50 or fewer.');
            return null;
        }
        
        // Hide timing stats until we have new results
        if (displayResults) {
            timingStats.style.display = 'none';
        }
        
        // Get worker count if using worker API
        const workerCount = apiType === 'worker' ? getWorkerCount() : null;
        
        // Set appropriate message based on API type
        const message = apiType === 'direct' 
            ? `Making ${requestCount} parallel requests to http://localhost:3000/api/hello...`
            : `Making ${requestCount} parallel requests via ${workerCount} Web Worker${workerCount > 1 ? 's' : ''} to http://localhost:3000/api/hello...`;
        
        if (displayResults) {
            resultDiv.innerHTML = `<p>${message}</p>`;
        }
        
        // Measure end-to-end time (including UI updates)
        const endToEndStartTime = performance.now();
        
        // Make API calls based on the type and process results
        const { results, totalProcessingTime } = apiType === 'direct'
            ? await makeParallelApiCalls(requestCount)
            : await makeWorkerApiCalls(requestCount);
        
        // Display the results
        if (displayResults) {
            resultDiv.innerHTML = generateResultsHtml(results);
        }
        
        // Calculate end-to-end time
        const endToEndTime = performance.now() - endToEndStartTime;
        
        // Display timing statistics
        if (displayResults) {
            endToEndTimeSpan.textContent = endToEndTime.toFixed(2);
            timingStats.style.display = 'block';
        }
        
        return {
            results,
            endToEndTime,
            totalProcessingTime
        };
        
    } catch (error) {
        if (displayResults) {
            document.getElementById('result').innerHTML = handleApiError(error);
            document.getElementById('timing-stats').style.display = 'none';
        }
        throw error;
    }
}

/**
 * Handle running both types of API requests sequentially and display comparison
 * @param {number} requestCount - Number of requests to make
 * @returns {Promise<void>}
 */
async function handleComparisonRequest(requestCount) {
    try {
        const resultDiv = document.getElementById('result');
        const comparisonStats = document.getElementById('comparison-stats');
        
        resultDiv.innerHTML = `<p>Running comparison experiment with ${requestCount} requests...</p>`;
        comparisonStats.style.display = 'none';
        
        // First run the main thread experiment
        resultDiv.innerHTML += `<p>Step 1: Running main thread experiment...</p>`;
        const directResults = await handleApiRequest('direct', requestCount, false);
        
        // Then run the web worker experiment
        resultDiv.innerHTML += `<p>Step 2: Running web worker experiment...</p>`;
        const workerResults = await handleApiRequest('worker', requestCount, false);
        
        // Calculate the time difference (which is better)
        const timeDifference = directResults.endToEndTime - workerResults.endToEndTime;
        const percentage = Math.abs(timeDifference) / directResults.endToEndTime * 100;
        const betterMethod = timeDifference > 0 ? 'Web Worker' : 'Main Thread';
        
        // Display comparison results
        document.getElementById('main-thread-time').textContent = directResults.endToEndTime.toFixed(2);
        document.getElementById('worker-thread-time').textContent = workerResults.endToEndTime.toFixed(2);
        document.getElementById('time-difference').textContent = 
            `${Math.abs(timeDifference).toFixed(2)} (${percentage.toFixed(1)}% ${betterMethod} is faster)`;
        comparisonStats.style.display = 'block';
        
        // Display the results from the last experiment (web worker)
        resultDiv.innerHTML = `
            <h3>Comparison Complete!</h3>
            <p>Main Thread method took ${directResults.endToEndTime.toFixed(2)}ms</p>
            <p>Web Worker method took ${workerResults.endToEndTime.toFixed(2)}ms</p>
            <p><strong>${betterMethod} was faster by ${Math.abs(timeDifference).toFixed(2)}ms (${percentage.toFixed(1)}%)</strong></p>
            <h4>Showing results from the Web Worker experiment:</h4>
            ${generateResultsHtml(workerResults.results)}
        `;
        
    } catch (error) {
        document.getElementById('result').innerHTML = handleApiError(error);
        document.getElementById('comparison-stats').style.display = 'none';
    }
}

/**
 * Initialize UI event handlers
 */
function initUI() {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize worker pool with default worker count
        const defaultWorkerCount = getWorkerCount();
        initializeWorkers(defaultWorkerCount);
        
        // Event listener for the direct API calls button
        document.getElementById('fetchParallelButton').addEventListener('click', async () => {
            const requestCount = parseInt(document.getElementById('requestCount').value, 10) || 10;
            await handleApiRequest('direct', requestCount);
        });
        
        // Event listener for the Web Worker fetch button
        document.getElementById('fetchWorkerButton').addEventListener('click', async () => {
            const requestCount = parseInt(document.getElementById('requestCount').value, 10) || 10;
            
            // Update worker count before making API calls
            const workerCount = getWorkerCount();
            initializeWorkers(workerCount);
            
            await handleApiRequest('worker', requestCount);
        });
        
        // Event listener for the comparison button (runs both methods sequentially)
        document.getElementById('fetchBothButton').addEventListener('click', async () => {
            const requestCount = parseInt(document.getElementById('requestCount').value, 10) || 10;
            
            // Update worker count before making API calls
            const workerCount = getWorkerCount();
            initializeWorkers(workerCount);
            
            await handleComparisonRequest(requestCount);
        });
        
        // Event listener for worker count changes
        document.getElementById('workerCount').addEventListener('change', () => {
            const workerCount = getWorkerCount();
            initializeWorkers(workerCount);
        });
    });
}

// Initialize the UI
initUI();

// Export UI functions (in case they need to be used elsewhere)
export { generateResultsHtml, handleApiError };