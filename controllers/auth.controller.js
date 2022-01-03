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

function requireAuth(req, res, next) {
    const token = req.cookies['authToken'];
    console.log('token is', token);

    function renderLoginPage() {
        return res.render('login', {
            title: 'Login',
            errorMessage: 'Please login to continue.',
        });
    }

    if (token === undefined) {
        // console.log('token is not set in cookie');
        res.status(401);
        return renderLoginPage();
    } else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log('token verify err', err);
                res.status(403);
                return renderLoginPage();
            } else {
                console.log('token verify user', user);
                res.locals.loggedIn = true;
                res.locals.user = user;
                req.user = user;
                next();
            }
        });
    }
}

module.exports = { hashPassword, generateJWT, setAuthToken, requireAuth };
