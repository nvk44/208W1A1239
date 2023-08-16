const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8080;
const TIMEOUT = 500; // Timeout in milliseconds

app.get('/numbers', async (req, res) => {
  try {
    const urlQueries = req.query.url;

    // Check if the 'url' parameter is missing or empty
    if (!urlQueries) {
      return res.status(400).json({ error: 'Missing or empty "url" parameter' });
    }

    // Convert a single URL to an array if needed
    const urls = Array.isArray(urlQueries) ? urlQueries : [urlQueries];
    
    // Fetch data from each URL and handle errors
    const fetchPromises = urls.map(async (url) => {
      try {
        const response = await axios.get(url, { timeout: TIMEOUT });
        return response.data.numbers || [];
      } catch (error) {
        console.error(`Error fetching data from ${url}: ${error.message}`);
        return [];
      }
    });

    // Wait for all requests to complete and merge the numbers
    const results = await Promise.all(fetchPromises);
    const mergedNumbers = results.flat();
    
    // Remove duplicates and sort the numbers
    const uniqueNumbers = Array.from(new Set(mergedNumbers)).sort((a, b) => a - b);

    return res.json({ numbers: uniqueNumbers });
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`number-management-service is running on port ${PORT}`);
});
