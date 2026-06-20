const { db } = require('../database/datasource.js');

const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = require('../middleware/validate');
const { ERROR_500, WRONG_ACCOUNT, MISSING_LOGIN_INFO, LOGIN_FAIL, LOGIN_SUCCESS, USERNAME_EXIST, SUCCESS } = require('../utils/VariableName.js');
const router = express.Router();

//Verify User
router.get('/', verifyToken, async (req, res) => {
    try {
        const foundUser = await db.users.findOneAsync({ username: req.executor.username });
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: WRONG_ACCOUNT
            });
        }

        delete foundUser.password;

        res.json({
            success: true,
            payload: foundUser
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: ERROR_500
        });
    }
});

//Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: MISSING_LOGIN_INFO
        });
    }

    try {
        const foundUser = await db.users.findOneAsync({ username: username.toLowerCase() });

        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: LOGIN_FAIL
            });
        }

        const passwordCheck = await argon2.verify(foundUser.password, password);

        if (!passwordCheck) {
            return res.status(400).json({
                success: false,
                message: LOGIN_FAIL
            });
        }

        const accessToken = jwt.sign(
            { username: foundUser.username },
            process.env.SECRET_TOKEN,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: LOGIN_SUCCESS,
            payload: accessToken
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: ERROR_500
        });
    }
})

//Register
router.post('/register', async (req, res) => {
    const { password, username } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: MISSING_LOGIN_INFO
        });
    }

    try {
        const foundUser = await db.users.findOneAsync({ username: username.toLowerCase() });

        if (foundUser) {
            return res.status(400).json({
                success: false,
                message: USERNAME_EXIST
            });
        }

        const hasedPassword = await argon2.hash(password);

        const newUser = {
            username: username.toLowerCase(),
            password: hasedPassword,
            role: 0
        };

        await db.users.insertAsync(newUser);

        const accessToken = jwt.sign({
            username: username.toLowerCase()
        },
            process.env.SECRET_TOKEN,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: SUCCESS,
            payload: accessToken
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: ERROR_500
        });
    }
})

module.exports = router;