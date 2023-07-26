const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const db = require('../database/manager');
require('dotenv').config();

const verifyToken = require('../middleware/validate');
const { ERROR_500, WRONG_ACCOUNT, MISSING_LOGIN_INFO, LOGIN_FAIL, LOGIN_SUCCESS, USERNAME_EXIST, SUCCESS } = require('../VariableName');
const router = express.Router();

//Verify User
router.get('/', verifyToken, async (req, res) => {
    // console.log('auth');
    try {
        const foundUser = db.get(req.executor.username);
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: WRONG_ACCOUNT
            });
        }

        // console.log(foundUser);

        delete foundUser.password;

        res.json({
            success: true,
            payload: foundUser
        })
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
        const foundUser = db.get(username.toLowerCase());

        // console.log(foundUser);

        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: LOGIN_FAIL
            });
        }

        // console.log(foundUser.password, password)

        const passwordCheck = await argon2.verify(foundUser.password, password);

        // console.log(passwordCheck);

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
    // console.log('register');
    const { password, username } = req.body;
    // console.log(password,username);
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: MISSING_LOGIN_INFO
        });
    }

    try {
        const foundUser = db.get(username.toLowerCase());

        if (foundUser) {
            return res.status(400).json({
                success: false,
                message: USERNAME_EXIST
            });
        }

        const hasedPassword = await argon2.hash(password);

        const newUser = {
            username: username.toLowerCase(),
            password: hasedPassword
        };

        await db.set(newUser);

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