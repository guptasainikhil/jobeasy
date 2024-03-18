const express = require('express');
const session = require('express-session');

const app = express();
const axios = require('axios');
const FormData = require('form-data');

app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const resume = req.files.resume;
    const formData = new FormData();
    formData.append('resume', resume.data, resume.name);

    try {
        const response = await axios.post('http://localhost:5000/process-file', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error processing file');
    }
});


// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware configuration
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Route for handling login
app.post('/login', (req, res) => {
  // Here, you would normally validate the user credentials with your database
  // For demonstration, we're assuming the credentials are valid
  req.session.userId = 'user123'; // Set a user id in the session
  res.send('Logged in successfully');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// const express = require('express');
// const fileUpload = require('express-fileupload');
// const fs = require('fs');
// const path = require('path');
// const pdfParse = require('pdf-parse');
// const textract = require('textract');
// const { NlpManager } = require('node-nlp');

// const app = express();
// app.use(fileUpload());

// // Define upload folder
// const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
// if (!fs.existsSync(UPLOAD_FOLDER)) {
//     fs.mkdirSync(UPLOAD_FOLDER);
// }

// // Load your skills list (adjust as needed)
// const skillsList = ["skill1", "skill2", "skill3"]; // replace with actual skills

// // NLP Manager for skill extraction
// const nlpManager = new NlpManager({ languages: ['en'] });
// // Add your NLP logic here

// // Endpoint for file upload
// app.post('/upload', (req, res) => {
//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }

//     const resume = req.files.resume;
//     const resumePath = path.join(UPLOAD_FOLDER, resume.name);

//     resume.mv(resumePath, err => {
//         if (err) {
//             return res.status(500).send(err);
//         }

//         const processFile = resume.name.endsWith('.pdf') ? pdfParse : textract.fromFileWithPath;
//         processFile(resumePath, (err, data) => {
//             if (err) {
//                 fs.unlinkSync(resumePath);
//                 return res.status(500).send(err);
//             }

//             const text = resume.name.endsWith('.pdf') ? data.text : data;
//             const extractedSkills = extractSkills(text, skillsList); // Implement this function

//             fs.unlinkSync(resumePath);
//             res.send({ skills: extractedSkills });
//         });
//     });
// });

// // Extract skills function (implement NLP logic here)
// function extractSkills(text, skillsList) {
//     // Your skill extraction logic
//     return []; // Return extracted skills
// }

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html')); // Create this HTML file for uploads
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
// app.use(fileUpload());