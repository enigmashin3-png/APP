const express = require('express');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client')));

// The "catchall" handler: for any request that doesn't
// match an API route, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Catch-all 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
