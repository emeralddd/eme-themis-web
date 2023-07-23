const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const tokenReceived = (authHeader ? authHeader.split(' ')[1] : authHeader);

    if(!tokenReceived) {
        return res.status(401).json({
            success: false,
            message: 'Chưa đăng nhập!'
        });
    }

    try {
        const tokenDecoded = jwt.verify(tokenReceived,process.env.SECRET_TOKEN);

        req.executor = {
            username: tokenDecoded.username,
        };

        next();
    } catch(err) {
        return res.status(403).json({
            success: false,
            message: "Phiên đăng nhập sai!"
        });
    }
}

module.exports = verifyToken;