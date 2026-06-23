const express = require('express');
const path = require('path');
const fileupload = require("express-fileupload");
const chokidar = require('chokidar');
require('dotenv').config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const { existsSync, mkdirSync } = require('fs');
const cookieParser = require('cookie-parser');

const requiredEnvVars = ['THEMIS_UPLOAD_PATH', 'PUBLIC_ATTACHMENTS_PATH', 'FRONTEND_INTEGRATION', 'FRONTEND_URL'];

requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`Error: Environment variable '${varName}' is not set. Please set it in your .env file.\r\nHint: You might forget to rename .env.example to .env and fill in the values.`);
        process.exit(1);
    }
});

const { uploadPath, attachmentsPath } = require('./utils/VariableName.js');

const PORT = process.env.PORT || 8000;
const app = express();
app.use(cookieParser());
const httpServer = createServer(app);

let corsOptions = {};
// If FRONTEND_INTEGRATION is false, enable CORS
if (process.env.FRONTEND_INTEGRATION === 'false') {
    corsOptions.cors = {
        origin: process.env.FRONTEND_URL,
        credentials: true
    };
    
    app.use(cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    }));
}

const io = new Server(httpServer, corsOptions);

const authRouter = require('./routes/auth');
const judgeRouter = require('./routes/judge');
const filesRouter = require('./routes/files');
const { handleLog, handleSubmission } = require('./utils/processSubmissions.js');

const requiredFolders = [
    attachmentsPath,
    uploadPath,
    `${uploadPath}/logs`,
    `${uploadPath}/queue`
];

requiredFolders.forEach(folder => {
    if (!existsSync(folder)) {
        mkdirSync(folder);
    }
});

app.use(express.json());
app.use(fileupload());

app.get('/api', (req, res) => {
    res.send('Backend is running!');
});

app.use('/api/auth', authRouter);
app.use('/api/judge', judgeRouter);
app.use('/api/files', filesRouter);

if (process.env.FRONTEND_INTEGRATION === 'true') {
    console.log('Running with frontend integration.');
    app.use(express.static(path.join(__dirname, './public')));
    app.get("*", (req, res) => {
        res.sendFile(
            path.join(__dirname, "./public/index.html")
        );
    });
} else {
    console.log('Running without frontend integration. CORS enabled for:', process.env.FRONTEND_URL);
}

console.log('Upload path set to:', uploadPath);

console.log('Attachments path set to:', attachmentsPath);

const logWatcher = chokidar.watch(`${uploadPath}/logs`, {
    ignored: /(^|[\/\\])\../,
    ignoreInitial: true,
    persistent: true
});

const submissionWatcher = chokidar.watch(`${uploadPath}/queue`, {
    ignored: /(^|[\/\\])\../,
    ignoreInitial: true,
    persistent: true
});

logWatcher
    .on('add', path => (path.endsWith('.log')) && handleLog(path, io));

submissionWatcher
    .on('add', path => (!path.endsWith('.log')) && handleSubmission(path, io));

io.on("connection", (socket) => {
    if (process.env.NODE_ENV === 'development') {
        console.log("New client connected", socket.id);
    }

    socket.on("disconnect", () => {
        if (process.env.NODE_ENV === 'development') {
            console.log("Client disconnected");
        }
    });

});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});