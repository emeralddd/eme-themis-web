const { db } = require('../database/manager.js');

const express = require('express');

const verifyToken = require('../middleware/validate');
const { ERROR_500, WRONG_ACCOUNT, MISSING_LOGIN_INFO, LOGIN_FAIL, LOGIN_SUCCESS, USERNAME_EXIST, SUCCESS } = require('../utils/VariableName.js');
const router = express.Router();

//Submit
router.post('/submit', verifyToken, async (req, res) => {
    let sourceFile = req.files.file, username = req.executor.username;

    if (sourceFile.name.split('.').length !== 2) {
        return res.status(400).json({
            success: false,
            message: `Tên bài không chứa kí tự đặc biêt!`
        });
    }

    let [fileName, fileExtension] = sourceFile.name.toUpperCase().split('.');

    let uploadPath = `./uploads/queue/${sourceFile.md5}[${username}][${fileName}].${fileExtension}`;

    // console.log(uploadPath);

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
    try {
        const data = await db.findAsync({}), participants = [];

        const problems = new Set();

        for (const user of data) {
            let sumOfPoints = 0, details = [];
            if (!user.problems) continue;
            for (const problem of user.problems) {
                if (problem.status === 0) continue;
                problems.add(problem.name);
                sumOfPoints += problem.point;
                details.push({
                    name: problem.name,
                    point: problem.point
                });
            }

            participants.push({
                username: user.username,
                total: sumOfPoints,
                details
            });
        }

        participants.sort((a, b) => (a.total > b.total ? -1 : 1));

        for (let i = 0; i < participants.length; i++) {
            if (i === 0 || participants[i].total !== participants[i - 1].total) {
                participants[i].rank = i + 1;
            } else {
                participants[i].rank = participants[i - 1].rank;
            }
        }

        res.json({
            success: true,
            payload: {
                problems: Array.from(problems),
                users: participants
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: ERROR_500
        });
    }
});

module.exports = router;