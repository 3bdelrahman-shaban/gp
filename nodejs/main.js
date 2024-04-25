const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors'); 

const app = express();

// CORS Configuration
const corsOptions = {
    origin: 'https://gp-henna.vercel.app', // Remove the trailing slash
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // enable set cookie
    allowedHeaders: ['Content-Type', 'Authorization'] // Specify an array of allowed headers
};

app.use(cors(corsOptions));
app.use(express.json());


app.options('*', cors(corsOptions));

app.use(express.json());

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// POST endpoint to receive image uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Spawn a child process to run the Python script
    const pythonProcess = spawn('python', ['./python.py', req.file.path]);

    let result = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.stdout.on('end', () => {
        console.log('Data from Python script received completely');
        console.log(`Result from Python script: ${result}`);
        
        // Parse the JSON result
        try {
            const parsedResult = JSON.parse(result);
            console.log(`Parsed result: ${parsedResult.text}`);
            
            // Send the extracted text to the client
            res.json({ text: parsedResult.text });
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
module.exports = app;
