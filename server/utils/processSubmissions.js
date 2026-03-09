const { db } = require('../database/manager.js');

const { rm, rename } = require('fs/promises');
const { readFileSync } = require('fs');

const fetchPath = (path) => {
    const fileAdded = path.split('\\').reverse()[0].split('.');
    return [...fileAdded[0].replaceAll('[', ']').split(']').filter(v => v), fileAdded[1]];
}

const statusEncode = {
    'ℱ': 2,
    '⚠': 3,
    'C': 4
}

module.exports.handleLog = async (path, io) => {
    const [md5, username, problemName] = fetchPath(path);

    const user = await db.findOneAsync({ username });

    if (!user) return;

    io.emit("reload", { data: username });

    if (!user.problems) return;

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

    // console.log('hey');

    io.emit("reload", { data: username });
    const user = await db.findOneAsync({ username });
    if (!user) return;
    if (!user.problems) user.problems = [];

    let index = -1;

    for (let i = 0; i < user.problems.length; i++) {
        if (user.problems[i].name === problemName) {
            index = i;
            break;
        }
    }

    try {
        const fileContent = readFileSync(`${path}`, 'utf-8');

        if (index === -1) {
            user.problems.push({
                name: problemName,
                point: 0,
                attemps: 0
            });
            index = user.problems.length - 1;
        }

        // console.log(index);

        if (user.problems[index].latest === md5) return;

        console.log(`./uploads/${user.problems[index].latest}[${username}][${problemName}].${extension}`);

        rm(`./uploads/${user.problems[index].latest}[${username}][${problemName}].${extension}`, {
            force: true
        }).catch(err => {
            console.log(err);
        });

        user.problems[index].code = fileContent;
        user.problems[index].attemps++;
        user.problems[index].latest = md5;
        user.problems[index].log = "";
        user.problems[index].status = 0;

        rename(`${path}`, `./uploads/${md5}[${username}][${problemName}].${extension}`);

        //0 - judging
        //1 - judged
        //2 - ce
        //3 - caution
        //4 - not judge

        // console.log(user);

        await db.updateAsync({ username }, { $set: { problems: user.problems } }, {});
    } catch (err) {
        console.error(err);
    }
}