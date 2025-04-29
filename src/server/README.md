# Server-Side Application

This folder contains the backend code for the Web Worker API Call Demo. It's a simple Express.js server that provides an API endpoint and serves the static client files.

## Files Structure

- `index.js` - Main server file with Express configuration and API endpoint
- `package.json` - Node.js project configuration and dependencies

## Features

- Simple Express.js server
- CORS support for API requests
- Static file serving of client application
- `/api/hello` endpoint that simulates a small processing delay

## How to Run the Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node index.js
   ```

The server will start on port 3000 by default (configurable via the PORT environment variable).

## API Documentation

### GET /api/hello

A simple endpoint that returns a greeting message.

**Response:**
```json
{
  "message": "Hello, World!"
}
```

The endpoint includes a 10ms artificial delay to simulate server processing time.

## Server Configuration

- **Port:** 3000 by default (configurable via the PORT environment variable)
- **CORS:** Enabled for all origins to support development
- **Static Files:** Serves files from the `../client` directory relative to the server