const express = require('express');
const db = require('../database/manager');

const verifyToken = require('../middleware/validate');
const { ERROR_500, WRONG_ACCOUNT, MISSING_LOGIN_INFO, LOGIN_FAIL, LOGIN_SUCCESS, USERNAME_EXIST, SUCCESS } = require('../VariableName');
const router = express.Router();

//Submit
router.post('/submit', verifyToken, async (req, res) => {
    let sourceFile = req.files.file, username = req.executor.username

    if (sourceFile.name.split('.').length !== 2) {
        return res.status(400).json({
            success: false,
            message: `Tên bài không chứa kí tự đặc biêt!`
        });
    }

    let [fileName, fileExtension] = sourceFile.name.toUpperCase().split('.');

    let uploadPath = `./uploads/queue/${sourceFile.md5}[${username}][${fileName}].${fileExtension}`;

    console.log(uploadPath);

    sourceFile.mv(uploadPath, err => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: err
            });
        }
    });

    res.json({
        success: true
    });
});

//Get Ranking
router.get('/getRanking', verifyToken, async (req, res) => {
    const data = db.getAll(), arr = [];

    const problems = new Set();

    for (const user of data) {
        let tmp = 0, details = [];
        for (let problem of user.problems) {
            if (problem.status === 0) continue;
            problems.add(problem.name);
            tmp += problem.point;
            details.push({
                name: problem.name,
                point: problem.point
            });
        }
        arr.push({
            username: user.username,
            total: tmp,
            details
        });
    }

    arr.sort((a, b) => (a.total > b.total ? -1 : 1));

    for (let i = 0; i < arr.length; i++) {
        if (i === 0 || arr[i].total !== arr[i - 1].total) {
            arr[i].rank = i + 1;
        } else {
            arr[i].rank = arr[i - 1].rank;
        }
    }

    res.json({
        success: true,
        payload: {
            problems: Array.from(problems),
            users: arr
        }
    });
});

module.exports = router;