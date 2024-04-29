const { run } = require('./gemini');
const express = require('express');
const cors = require("cors");
const multer =require('multer');
const Tesseract =require("tesseract.js");
const app = express();
// const corsOptions = {
//     origin: 'https://blind-assistant-bktuudmmf-3bdelrahmanshabans-projects.vercel.app',
//      // Update with your Angular app URL
//     optionsSuccessStatus: 200,
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,            // enable set cookie
//     allowedHeaders: "*"
// };

app.use(cors());
app.use(express.json());

app.post('/api/control', async (req, res) => {
    try {
        console.log(req.body);
        const message = req.body.message;
        const result = await run(message);
        console.log('Received message:', message);
        console.log(result);
        res.json({ message: result });
    } catch (error) {
        console.error("Error occurred in API control endpoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads/');
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
const upload= multer({storage:storage});

app.post('/upload',upload.single('uploadedImage'),(req,res)=>{
    console.log(req.file);
    try{
        Tesseract.recognize(
            'uploads/'+req.file.filename,
            'eng',
            {logger:m =>console.log(m)}
        ).then(({data:{text}})=>{
            return res.json(
                {
                    message:text
                }
            )
        })          
    }catch(error){
        console.error(error)
    }
 })

module.exports = app;
