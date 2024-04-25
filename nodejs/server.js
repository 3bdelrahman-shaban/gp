const { run } = require('./gemini');
const express = require('express');
const cors = require("cors");

const app = express();
const corsOptions = {
    origin: 'https://gp-henna.vercel.app', // Remove the trailing slash
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // enable set cookie
    allowedHeaders: ['Content-Type', 'Authorization'] // Specify an array of allowed headers
};

app.use(cors(corsOptions));
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
app.listen(3001, () => {
    console.log("Server is Running")
})
module.exports = app;
