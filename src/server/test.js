const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.json({ message: 'Test successful' });
});

app.listen(8080, '127.0.0.1', () => {
    console.log('Test server running on port 8080');
}); 