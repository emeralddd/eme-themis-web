const express = require('express');
const { readFileSync, readdirSync, readFile, statSync, stat } = require('fs');

const verifyToken = require('../middleware/validate');
const { PATH_NOT_EXIST, attachmentsPath } = require('../utils/VariableName');
const path = require('path');
const router = express.Router();

//Get Ranking
router.get('/getAttachments', verifyToken, async (req, res) => {
    const dir = req.query.path;

    //path = / => attachment//
    //path = /abc => attachment//abc
    //path = /abc/xyz.docx => attachment//abc/xyz.docx

    if (dir.includes('..')) {
        return res.status(400).json({
            success: false,
            message: PATH_NOT_EXIST
        });
    }

    try {
        const dirPath = path.join(attachmentsPath, dir);
        const ls = readdirSync(dirPath, {
            withFileTypes: true
        });

        const statRequests = [];

        for (const i of ls) {
            statRequests.push(new Promise((resolve, reject) => {
                stat(`${dirPath}/${i.name}`, (_, stats) => {
                    resolve({
                        name: i.name,
                        date: stats.birthtime,
                        size: stats.size,
                        isFolder: i.isDirectory()
                    });
                });
            }));
        }

        const statResult = await Promise.all(statRequests);
        const folders = [], files = [];

        for (const i of statResult) {
            if (i.isFolder) {
                folders.push(i);
            } else {
                files.push(i);
            }
        }

        res.json({
            success: true,
            payload: {
                folders,
                files
            }
        });
    } catch (err) {
        console.log(err);
        res.status(401).json({
            success: false,
            message: PATH_NOT_EXIST
        });
    }
});

router.get('/getAttachmentBuffer', verifyToken, async (req, res) => {
    const dir = req.query.path;

    if (dir.includes('..')) {
        return res.status(400).json({
            success: false,
            message: PATH_NOT_EXIST
        });
    }

    try {
        const buffer = readFileSync(path.join(attachmentsPath, dir));

        res.json({
            success: true,
            payload: buffer
        });
    } catch (err) {
        console.log(err);
        res.status(401).json({
            success: false,
            message: PATH_NOT_EXIST
        });
    }
});

module.exports = router;