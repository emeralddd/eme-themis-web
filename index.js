const express = require('express');
const path = require('path');
const fileupload = require("express-fileupload");
const cors = require('cors');
const db = require('./database/manager.js');
const chokidar = require('chokidar');
require('dotenv').config();
const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 8000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: "*",
    }
});

const authRouter = require('./routes/auth');
const judgeRouter = require('./routes/judge');
const filesRouter = require('./routes/files');
const {handleLog, handleSubmission} = require('./database/processSubmissions.js');

db.importData();

// app.use(cors());
app.use(express.json());
app.use(fileupload());

app.get('/api', (req, res) => {
    res.send(process.env.NODE_ENV);
});

app.use('/api/auth', authRouter);
app.use('/api/judge', judgeRouter);
app.use('/api/files', filesRouter);

if(process.env.NODE_ENV === 'production') {
    console.log('PRODUCTION');
    app.use(express.static(path.join(__dirname, './frontend')));
    app.get("*", (req, res) => {
        res.sendFile(
          path.join(__dirname, "./frontend/index.html")
        );
    });
}

const logWatcher = chokidar.watch('./uploads/logs', {
    ignored: /(^|[\/\\])\../,
    ignoreInitial: true,
    persistent: true
});

const submissionWatcher = chokidar.watch('./uploads', {
    ignored: /(^|[\/\\])\../,
    ignoreInitial: true,
    persistent: true
});

logWatcher
    .on('add', path => (path.endsWith('.log'))&&handleLog(path,io));

submissionWatcher
    .on('add', path => (!path.endsWith('.log'))&&handleSubmission(path,io));

io.on("connection", (socket) => {
    console.log("New client connected",socket.id); 
    
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });

});

httpServer.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});