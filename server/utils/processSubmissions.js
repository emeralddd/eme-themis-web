const { db } = require('../database/datasource.js');

const { rm, rename } = require('fs/promises');
const { readFileSync } = require('fs');

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

    let index = -1;

    for (let i = 0; i < user.problems.length; i++) {
        if (user.problems[i].name === problemName) {
            index = i;
            break;
        }
    }

    if (index === -1) return;

    if (user.problems[index].latest !== md5) return;

    const log = readFileSync(`./${path}`, 'utf-8');
    let point = log.split(/\r?\n/)[0].split(`${username}‣${problemName}: `)[1];

    if (statusEncode[point[0]]) {
        user.problems[index].status = statusEncode[point[0]];
        point = 0;
    } else {
        user.problems[index].status = 1;
        point = Number(point);
    }

    user.problems[index].point = point;
    user.problems[index].log = log;

    // console.log(user.problems);

    await db.updateAsync({ username }, { $set: { problems: user.problems } }, {});
}

module.exports.handleSubmission = async (path, io) => {
    const [md5, username, problemName, extension] = fetchPath(path);

    io.emit("reload", { data: username });

    try {
        const fileContent = readFileSync(`${path}`, 'utf-8');

        const submissionWithSameMD5 = await db.submissions.findOneAsync({ md5 });

        if (submissionWithSameMD5) {
            return rm(`./uploads/${user.problems[index].latest}[${username}][${problemName}].${extension}`, {
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

        rename(`${path}`, `./uploads/${md5}[${username}][${problemName}].${extension}`);
    } catch (err) {
        console.error(err);
    }
}