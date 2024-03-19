const express = require('express');
const session = require('express-session');
const axios = require('axios');
const FormData = require('form-data');
const fileUpload = require('express-fileupload'); // Ensure you have express-fileupload installed

const app = express();

// Middleware to handle file uploads
app.use(fileUpload({
    createParentPath: true // Automatically create the directory for storing the files if it doesn't exist
}));

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware configuration
app.use(session({
    secret: 'your_secret_key', // Replace 'your_secret_key' with a real secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Endpoint to handle file uploads and communicate with the Flask backend
app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const resume = req.files.resume;
    const formData = new FormData();
    formData.append('resume', resume.data, resume.name);

    try {
        // Post the file to the Flask app's '/upload' endpoint
        const response = await axios.post('http://localhost:5000/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        // Send the Flask app's response back to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing file');
    }
});

// Route for handling login (this remains as you had it, without changes)
app.post('/login', (req, res) => {
    // Login logic here
    req.session.userId = 'user123'; // Example session setting
    res.send('Logged in successfully');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
