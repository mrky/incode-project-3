const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Schedule = require('../models/schedules.model');
const User = require('../models/users.model');
const Auth = require('../controllers/auth.controller');

router.get('/', Auth.requireAuth, (req, res) => {
    const title = 'All Schedules';

    Schedule.getSchedules()
        .then((schedules) => {
            let message;

            if (schedules.length === 0) {
                message = 'There are no schedules.';
            }

            res.render('schedules', {
                title,
                schedules,
                showLink: true,
                message,
            });
        })
        .catch((err) => {
            console.log('err inside get/');
            console.log(err);
            res.render('schedules', { title });
        });
});

router.get('/login', (req, res) => {
    const title = 'Login';
    res.render('login', { title });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log('body is', req.body);

    if (email !== '' && password !== '') {
        User.login(email)
            .then(async (user) => {
                console.log('user is', user);
                if (user !== undefined && user.length > 0) {
                    const correctPassword = await bcrypt.compare(
                        password,
                        user[0].password
                    );

                    if (correctPassword) {
                        const payload = { ...user[0] };
                        delete payload.password;
                        const token = Auth.generateJWT(payload);
                        Auth.setAuthToken(token, res);
                        console.log('user found, redirecting in if');
                        res.redirect('/');
                    } else {
                        console.log('incorrect password');
                        res.redirect('/login');
                    }
                } else {
                    console.log('user not found, redirecting in else');
                    res.redirect('/login');
                }
            })
            .catch((err) => {
                console.log('err in post/login', err);
                console.log('redirecting in catch');
                res.redirect('/login');
            });
    } else {
        res.redirect('/login');
    }
});

router.get('/signup', (req, res) => {
    const title = 'Sign up';
    res.render('formAddUser', { title });
});

router.post('/signup', (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        res.redirect('/signup');
    } else {
        Auth.hashPassword(password)
            .then((hashedPassword) => {
                const newUser = {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password: hashedPassword,
                };

                User.insertUser(newUser)
                    .then((insertedUserId) => {
                        const payload = {
                            userId: insertedUserId,
                            firstName,
                            lastName,
                            email,
                        };
                        const token = Auth.generateJWT(payload);
                        Auth.setAuthToken(token, res);
                        res.redirect('/');
                    })
                    .catch((err) => {
                        console.log('err inside post/users');
                        console.log(err);
                        res.redirect('/signup');
                    });
            })
            .catch((error) => {
                console.log('err in signup');
                res.redirect('/signup');
            });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.render('login', {
        title: 'Login',
        successMessage:
            'You have been successfully logged out. Please login again to use the site.',
    });
});

module.exports = router;
