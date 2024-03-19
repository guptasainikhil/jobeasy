


const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const { spawn } = require('child_process');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());


// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure the uploads folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Serve static files from 'public' directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: '9e5a0e60819b6be2ad5ce9d08301d83c93efa3f48e2a9fec04aa4242cf01f788', // Change this to a random secret string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: !true } // Set to true only if you're using HTTPS
}));

// Setting up the MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Nikhil@2000",
  database: "jobeasy",
  port: 3306
});

// Connect to the MySQL server
connection.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the DB: ', err);
    return;
  }
  console.log('Connected to MySQL server successfully.');
});

// Serve the login page as the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// After login, serve the index.html on a different route, say '/home'
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/quiz-questions', (req, res) => {
    fs.readFile(path.join(__dirname, 'quiz-questions.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not retrieve quiz questions. Please try again later.');
        }
        res.json(JSON.parse(data));
    });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Query to find the user with the given username and password
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
      if (err) {
          console.error('An error occurred while fetching user data: ', err);
          return res.status(500).send('An error occurred while logging in. Please try again later.');
      }

      if (results.length > 0) {
          req.session.username = username; // Store username in session
          res.redirect('/home'); // Redirect to '/home' after successful login
      } else {
          res.status(401).send('Incorrect username or password.');
      }
  });
});
// This is just a placeholder example upon successful login
// Replace it with your actual login success logic
app.post('/update-personality', (req, res) => {
  const { username, personalityType } = req.body;

  // SQL query to update the user's personality type
  const query = 'UPDATE users SET MBTI = ? WHERE username = ?';

  connection.query(query, [personalityType, username], (err, results) => {
      if (err) {
          console.error('An error occurred while updating the personality type: ', err);
          return res.status(500).send('An error occurred while updating the personality type. Please try again later.');
      }

      // Check if the update was successful
      if (results.affectedRows > 0) {
          res.send({ message: 'Personality type updated successfully' });
      } else {
          res.status(404).send({ message: 'User not found' });
      }
  });
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Query to insert a new user
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('An error occurred during user registration: ', err);
            return res.status(500).send('An error occurred during signup. Please try again later.');
        }
        res.redirect('login.html'); // Redirect to login page after successful signup
    });
});

// Route for handling file uploads and skill extraction
app.post('/upload', upload.single('resume'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  // Determine file type
  const fileType = path.extname(file.originalname).slice(1); // Remove the dot

  // Spawn the Python process
  const pythonProcess = spawn('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3', ['process_resume.py', file.path, fileType]);


  pythonProcess.stdout.on('data', (data) => {
    // Assuming Python script outputs JSON
    res.json(JSON.parse(data));
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    res.status(500).send('Error processing file.');
  });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });