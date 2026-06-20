const { db } = require('../database/datasource.js');

const express = require('express');

const verifyToken = require('../middleware/validate');
const { ERROR_500, WRONG_ACCOUNT, MISSING_LOGIN_INFO, LOGIN_FAIL, LOGIN_SUCCESS, USERNAME_EXIST, SUCCESS } = require('../utils/VariableName.js');
const router = express.Router();

// Submit - will be modified
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

// Get Ranking
router.get('/getRanking', verifyToken, async (req, res) => {
    try {
        // Get all accepted submissions, sort by submission time
        const data = await db.submissions
            .findAsync({ status: 2 })
            .sort({ submissionTime: -1 });

        // Create a list of participants and their best score for each problem
        const participants = [];

        // Helper function to create a new participant if they don't exist
        const newParticipant = (username) => {
            const participant = {
                username,
                problems: [],
            };

            participants.push(participant);

            return participant;
        };

        const problems = [];

        for (const submission of data) {
            // Add problem to the list of problems
            problems.push(submission.problem);

            // Find the participant for the submission, or create a new one if it doesn't exist
            const userInParticipants = participants.find(p => p.username === submission.username) || newParticipant(submission.username);

            // If the participant doesn't have a score for the problem, add it to their list of problems
            // We only add the first accepted submission for each problem, since the data is sorted by submission time
            if (!userInParticipants.problems.some(p => p.name === submission.problem)) {
                userInParticipants.problems.push({
                    name: submission.problem,
                    score: submission.score
                });
            }
        }

        res.json({
            success: true,
            payload: {
                problems: Array.from(new Set(problems)),
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

// Get user problems
router.get('/getUserProblems', verifyToken, async (req, res) => {
    try {
        const userSubmissions = await db.submissions
            .findAsync({ username: req.executor.username })
            .sort({ problem: 1, submissionTime: -1 });
        
        const problems = [];

        for (const submission of userSubmissions) {
            // If the participant doesn't have a score for the problem, add it to their list of problems
            // We only add the first accepted submission for each problem, since the data is sorted by submission time
            if (!problems.some(p => p.problem === submission.problem)) {
                problems.push(submission);
            }
        }

        res.json({
            success: true,
            payload: problems
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