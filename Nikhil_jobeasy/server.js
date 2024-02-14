const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3000;

// Setting up the MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Nikhil@2000",
    database: "jobeasy", // Your database name
    port: 3306 // MySQL server's port
});

// Connect to the MySQL server
connection.connect(err => {
    if (err) {
        console.error('An error occurred while connecting to the DB: ', err);
        return;
    }
    console.log('Connected to MySQL server successfully.');
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

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
    // Query to find the user with the given username
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('An error occurred while fetching user data: ', err);
            return res.status(500).send('An error occurred while logging in. Please try again later.');
        }

        if (results.length > 0) {
            res.redirect('/home'); // Redirect to '/home' after successful login
        } else {
            res.status(401).send('Incorrect username or password.');
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
        res.send(`<script>alert('Signup successful'); window.location.href = '/';</script>`);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});




// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const path = require('path');
// const bcrypt = require('bcrypt');
// const mysql = require('mysql');

// const app = express();
// const port = process.env.PORT || 3000;

// // Setting up the MySQL connection
// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "Nikhil@2000",
//     database: "jobeasy", // Add your database name here
//     port: 3306 // Make sure this is your MySQL server's port
// });

// // Connect to the MySQL server
// connection.connect(err => {
//     if (err) {
//         console.error('An error occurred while connecting to the DB: ', err);
//         return;
//     }
//     console.log('Connected to MySQL server successfully.');
// });

// app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: true }));

// // Serve the login page as the root
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

// // After login, serve the index.html on a different route, say '/home'
// app.get('/home', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/quiz-questions', (req, res) => {
//     fs.readFile(path.join(__dirname, 'quiz-questions.json'), 'utf8', (err, data) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Could not retrieve quiz questions. Please try again later.');
//         }
//         res.json(JSON.parse(data));
//     });
// });

// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     // Query to find the user with the given username
//     const query = 'SELECT * FROM users WHERE username = ?';
//     connection.query(query, [username], async (err, results) => {
//         if (err) {
//             console.error('An error occurred while fetching user data: ', err);
//             return res.status(500).send('An error occurred while logging in. Please try again later.');
//         }

//         if (results.length === 0) {
//             return res.status(401).send('Incorrect username or password.');
//         }

//         // Compare hashed password
//         const match = await bcrypt.compare(password, results[0].password);
//         if (match) {
//             res.redirect('/home'); // Redirect to '/home' after successful login
//         } else {
//             res.status(401).send('Incorrect username or password.');
//         }
//     });
// });

// app.post('/signup', async (req, res) => {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

//     // Query to insert a new user
//     const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     connection.query(query, [username, hashedPassword], (err, results) => {
//         if (err) {
//             console.error('An error occurred during user registration: ', err);
//             return res.status(500).send('An error occurred during signup. Please try again later.');
//         }
//         res.send(`<script>alert('Signup successful'); window.location.href = '/';</script>`);

//     });
// });

// app.listen(port, () => {
//     console.log(`Server listening at http://localhost:${port}`);
// });



