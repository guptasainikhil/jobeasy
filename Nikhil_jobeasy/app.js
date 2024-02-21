const express = require('express');
const session = require('express-session');

const app = express();

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
