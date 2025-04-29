const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Helper function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// CORS middleware - Add this before other middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});


// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Simple GET endpoint with support for parallel requests
app.get('/api/hello', async (req, res) => {
  // Add 10ms processing delay (each request processed independently)
  await delay(10);
  res.json({ message: 'Hello, World!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Static files served from ${path.join(__dirname, '../client')}`);
});