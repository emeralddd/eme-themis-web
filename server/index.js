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

const { uploadPath } = require('./utils/VariableName.js');

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
    path.join(__dirname, './attachments'),
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
    console.log('FRONTEND_INTEGRATION is enabled. Serving frontend from Express.');
    app.use(express.static(path.join(__dirname, './public')));
    app.get("*", (req, res) => {
        res.sendFile(
            path.join(__dirname, "./public/index.html")
        );
    });
}

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
    console.log("New client connected", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });

});

httpServer.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});