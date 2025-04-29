# Client-Side Application

This folder contains the frontend code for the Web Worker API Call Demo. The application demonstrates how to use Web Workers to improve performance when making multiple parallel API requests.

## Files Structure

- `index.html` - The main HTML file with the user interface
- `app.js` - Main entry point that imports and re-exports functionality
- `direct-api.js` - Functions for making API calls directly on the main thread
- `worker-api.js` - Functions for distributing API calls across Web Workers
- `ui.js` - UI related functionality
- `workers/api-worker.js` - Web Worker implementation for API calls

## Key Components

### Direct API Module (`direct-api.js`)

Handles making API calls directly on the main thread:
- `fetchHelloData()` - Makes a single API call to the server
- `makeParallelApiCalls(requestCount)` - Makes multiple parallel API calls using Promise.all()

### Worker API Module (`worker-api.js`)

Manages Web Workers and distributes API calls:
- `initializeWorkers(workerCount)` - Sets up the worker pool
- `makeWorkerApiCalls(requestCount)` - Distributes API calls across multiple workers
- `workerPool` - Manages the lifecycle of Web Worker instances

### Web Worker (`workers/api-worker.js`)

Handles API calls in separate threads to avoid blocking the main thread.

## How to Use the UI

1. Set the "Number of requests" (how many API calls to make)
2. Set the "Number of workers" (how many Web Workers to distribute the work across)
3. Choose an option to test:
   - "Fetch in Main Thread" - Make all API calls in the main UI thread
   - "Fetch in Web Worker" - Distribute API calls across Web Workers
   - "Run Both Sequentially" - Run both methods one after the other to compare

The results display will show:
- Performance metrics for each method
- Comparison between the two approaches when using "Run Both Sequentially"