const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Serve static files from 'public' directory
app.use(express.static('public'));

// Route for handling file uploads
app.post('/upload', upload.single('resume'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  // Determine file type
  const fileType = path.extname(file.originalname).slice(1); // Remove the dot

  // Spawn the Python process
  const pythonProcess = spawn('python', ['process_resume.py', file.path, fileType]);

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
  console.log(`Server running at http://localhost:${port}`);
});
