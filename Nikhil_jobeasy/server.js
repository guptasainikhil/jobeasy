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

// app.post('/signup', (req, res) => {
//     const { username, password } = req.body;

//     // Query to insert a new user
//     const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     connection.query(query, [username, password], (err, results) => {
//         if (err) {
//             console.error('An error occurred during user registration: ', err);
//             return res.status(500).send('An error occurred during signup. Please try again later.');
//         }
//         res.send(`<script>alert('Signup successful'); window.location.href = 'login.html';</script>`);
//     });
// });
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Query to insert a new user
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('An error occurred during user registration: ', err);
            return res.status(500).send('An error occurred during signup. Please try again later.');
        }

        // Send a script with an alert and redirection
        const script = `
            <script>
                alert('Signup successful');
                window.location.href = 'login.html';
            </script>
        `;
        res.send(script);
    });
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
app.get('/home', (req, res) => {
    // Assume 'username' is stored in session upon successful login
    if (!req.session.username) {
        return res.redirect('/'); // Redirect to login page if not logged in
    }

    // Use the username from the session to fetch user details
    const query = 'SELECT name, username, location, age, gender, personality_type FROM users WHERE username = ?';
    connection.query(query, [req.session.username], (err, results) => {
        if (err) {
            console.error('An error occurred while fetching user details: ', err);
            return res.status(500).send('An error occurred. Please try again later.');
        }

        if (results.length > 0) {
            const user = results[0];
            // Ideally, pass the user data to the template engine to render the dashboard
            // For simplicity, redirecting to a static dashboard page here
            res.redirect('/dashboard.html'); // Ensure you have a dashboard.html in your 'public' directory
        } else {
            res.status(404).send('User not found.');
        }
    });
});
const session = require('express-session');

// Session setup
app.use(session({
    secret: 'your_secret_key', // Change this to a random secret string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true } // Set to `true` only if you're using HTTPS
}));

// Modified /home route to fetch user details
app.get('/home', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/'); // Redirect to login if not logged in
    }

    const query = 'SELECT name, username, location, age, gender, personality_type FROM users WHERE username = ?';
    connection.query(query, [req.session.username], (err, results) => {
        if (err) {
            console.error('An error occurred while fetching user details: ', err);
            return res.status(500).send('An error occurred. Please try again later.');
        }

        if (results.length > 0) {
            const user = results[0];
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'), { user }); // Send the dashboard page and user data
        } else {
            res.status(404).send('User not found.');
        }
    });
});
app.get('/api/userdata', (req, res) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const query = 'SELECT name, username, location, age, gender, personality_type FROM users WHERE username = ?';
    connection.query(query, [req.session.username], (err, results) => {
        if (err) {
            console.error('An error occurred while fetching user data: ', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];
            res.json(user); // Send user data as JSON
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
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



