const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedules.model');
const User = require('../models/users.model');
const crypto = require('crypto');

router.get('/', (req, res) => {
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

router.get('/signup', (req, res) => {
    const title = 'Sign up';
    res.render('formAddUser', { title });
});

router.post('/signup', (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        res.redirect('/signup');
    } else {
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('base64');

        const newUser = {
            first_name: firstName,
            last_name: lastName,
            email,
            password: hashedPassword,
        };

        User.insertUser(newUser)
            .then(() => {
                res.redirect('/users');
            })
            .catch((err) => {
                console.log('err inside post/users');
                console.log(err);
                res.redirect('/users');
            });
    }
});

module.exports = router;
