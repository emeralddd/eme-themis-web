const { db } = require('../database/datasource.js');

const { rm, rename } = require('fs/promises');
const { readFileSync } = require('fs');
const path = require('path');
const { uploadPath } = require('./VariableName.js');

// Split the path to get md5, username, problemName and extension from absolutePath/[md5][username][problemName].extension
const fetchPath = (path) => {
    const fileAdded = path.split('\\').reverse()[0].split('.');
    return [...fileAdded[0].replaceAll('[', ']').split(']').filter(v => v), fileAdded[1]];
}

// status: 0 - waiting for judger, 1 - judging, 2 - judged, 3 - ℱ, 4- ⚠, 5 - C

const statusEncode = {
    'ℱ': 3,
    '⚠': 4,
    'C': 5
}

module.exports.handleLog = async (path, io) => {
    const [md5, username, problemName] = fetchPath(path);

    io.emit("reload", { data: username });

    const submission = await db.submissions.findOneAsync({ md5 });

    if (!submission) {
        return;
    }

    const log = readFileSync(path, 'utf-8');
    let point = log.split(/\r?\n/)[0].split(`${username}‣${problemName}: `)[1];

    if (statusEncode[point[0]]) {
        submission.status = statusEncode[point[0]];
        point = 0;
    } else {
        submission.status = 2;
        point = Number(point);
    }

    submission.logs = log;
    submission.score = point;

    await db.submissions.updateAsync({ md5 }, { $set: { status: submission.status, logs: submission.logs, score: submission.score } }, {});
}

module.exports.handleSubmission = async (filePath, io) => {
    const [md5, username, problemName, extension] = fetchPath(filePath);

    io.emit("reload", { data: username });

    try {
        const fileContent = readFileSync(filePath, 'utf-8');

        const submissionWithSameMD5 = await db.submissions.findOneAsync({ md5 });

        if (submissionWithSameMD5) {
            return rm(filePath, {
                force: true
            }).catch(err => {
                console.log(err);
            });
        }

        const newSubmission = {
            username,
            problem: problemName,
            fileContent,
            md5,
            score: 0,
            status: 1,
            logs: '',
            submissionTime: new Date(),
        };
        
        await db.submissions.insertAsync(newSubmission);

        console.log(path.join(uploadPath , `${md5}[${username}][${problemName}].${extension}`));

        await rename(filePath, path.join(uploadPath , `${md5}[${username}][${problemName}].${extension}`));
    } catch (err) {
        console.error(err);
    }
}