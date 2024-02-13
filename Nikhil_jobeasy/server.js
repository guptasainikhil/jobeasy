const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for the root path
app.get('/', (req, res) => {
    // Send 'index.html' when users access the root path
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for serving quiz questions
app.get('/quiz-questions', (req, res) => {
    // Assuming 'quizQuestions.json' is in the same directory as your server.js
    fs.readFile(path.join(__dirname, 'quiz-questions.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading quiz questions file');
        }
        res.json(JSON.parse(data));
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
