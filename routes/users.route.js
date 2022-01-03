const express = require('express');
const router = express.Router();
const User = require('../models/users.model');
const Schedule = require('../models/schedules.model');

router.get('/', (req, res) => {
    const title = 'All Users';

    User.getUsers()
        .then((users) => {
            res.render('users', {
                title,
                users,
                linkName: true,
                linkSchedules: false,
            });
        })
        .catch((err) => {
            console.log('err inside getUsers');
            console.log(err);
            res.redirect('/');
        });
});

router.get('/new', (req, res) => {
    const title = 'Add a New User';
    res.render('formAddUser', { title });
});

router.get('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    let title = 'User does not exist';
    let linkName = false;
    let linkSchedules = false;

    if (isNaN(userId)) {
        res.render('users', {
            title,
            users: null,
            linkName,
            linkSchedules,
        });
    } else {
        User.getUserById(userId)
            .then((user) => {
                if (user !== undefined && user.length > 0) {
                    title = `${user[0].firstName} ${user[0].lastName}'s Profile`;
                    linkSchedules = true;
                }

                res.render('users', {
                    title,
                    users: user,
                    linkName,
                    linkSchedules,
                });
            })
            .catch((err) => {
                console.log('err inside get/user/id');
                console.log(err);
                res.render('users', {
                    title,
                    linkName,
                    linkSchedules,
                });
            });
    }
});

router.get('/:userId/schedules', (req, res) => {
    const userId = parseInt(req.params.userId);

    let title = 'User does not exist';

    if (isNaN(userId)) {
        res.render('schedules', { title });
    } else {
        Schedule.getUserSchedules(userId)
            .then((userSchedules) => {
                let message;
                let schedules;

                if (userSchedules.length === 0) {
                    res.render('schedules', { title });
                } else {
                    let messageFullName;
                    let messageFirstName;

                    if (userId === res.locals.user.userId) {
                        messageFullName = 'My';
                        messageFirstName = 'You do';
                    } else {
                        messageFullName = `${userSchedules[0].firstName} ${userSchedules[0].lastName}'s`;
                        messageFirstName = userSchedules[0].firstName + 'does';
                    }

                    title = `${messageFullName} Schedules`;

                    if (userSchedules[0].scheduleId === null) {
                        message = `${messageFirstName} not have any schedules.`;
                        schedules = null;
                    } else {
                        schedules = userSchedules;
                    }

                    res.render('schedules', {
                        title,
                        schedules,
                        message,
                        showLink: false,
                    });
                }
            })
            .catch((err) => {
                console.log('err inside get/user/id/schedules');
                console.log(err);
                res.render('/schedule', { title });
            });
    }
});

module.exports = router;
