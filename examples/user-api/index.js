// Example API endpoint
// This file demonstrates contract-based development

const express = require('express');
const app = express();

// CONTRACT: GET /api/users
// Returns: { users: Array<{id: string, name: string}> }
app.get('/api/users', (req, res) => {
  // Start with mock, replace with real DB
  res.json({
    users: [
      { id: '1', name: 'Example User' }
    ]
  });
});

app.listen(3000);
