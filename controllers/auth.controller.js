const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function hashPassword(password) {
    const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('base64');

    return hashedPassword;
}

function generateJWT(payload) {
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
    return token;
}

function setAuthToken(token, res) {
    res.cookie('authToken', token);
}

module.exports = { hashPassword, generateJWT, setAuthToken };
