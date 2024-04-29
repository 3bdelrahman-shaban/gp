// const express = require('express');
// const multer = require('multer');
// const { spawn } = require('child_process');
// const cors = require('cors'); 

// const app = express();

// // CORS Configuration
// // const corsOptions = {
// //     origin: 'https://blind-assistant-82wc7kjo1-3bdelrahmanshabans-projects.vercel.app', // Update with your Angular app URL
// //     optionsSuccessStatus: 200,
// //     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
// //     credentials: true,            // enable set cookie
// //     allowedHeaders: "Content-Type, Authorization"
// // };

// app.use(cors());
// app.use(express.json());

// // Multer configuration for handling file uploads
// const storage = multer.diskStorage({
//     destination: 'uploads/',
//     filename: function(req, file, cb) {
//         cb(null, file.originalname);
//     }
// });

// const upload = multer({ storage: storage });

// // POST endpoint to receive image uploads
// app.post('/upload', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Spawn a child process to run the Python script
//     const pythonProcess = spawn('python', ['./python.py', req.file.path]);

//     let result = '';

//     pythonProcess.stdout.on('data', (data) => {
//         result += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     pythonProcess.stdout.on('end', () => {
//         console.log('Data from Python script received completely');
//         console.log(`Result from Python script: ${result}`);
        
//         // Parse the JSON result
//         try {
//             const parsedResult = JSON.parse(result);
//             console.log(`Parsed result: ${parsedResult.text}`);
            
//             // Send the extracted text to the client
//             res.json({ text: parsedResult.text });
            
//         } catch (error) {
//             console.error('Error parsing JSON:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     });

//     pythonProcess.on('close', (code) => {
//         console.log(`child process exited with code ${code}`);
//     });
// });

// module.exports = app;
// ________________________
const express = require('express');
const app = express();
const multer = require('multer');
const cors = require("cors");
const Tesseract = require("tesseract.js");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(cors());

app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file);

    try {
        Tesseract.recognize(
            'uploads/' + req.file.filename,
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            return res.json({
                text: text
            });
        });
    } catch (error) {
        console.error(error);
    }
});

app.listen(3000, () => {
    console.log("Server is up running on port 3000");
});
