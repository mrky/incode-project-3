const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const port = 3002;
const crypto = require('crypto');

require('dotenv').config();

const User = require('./models/users.model');
const Schedule = require('./models/schedules.model');

// use dayjs to generate a list of months to use in formAddSchedule
const dayjs = require('dayjs');
const localeData = require('dayjs/plugin/localeData');
dayjs.extend(localeData);
const months = dayjs.months();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.engine(
    'hbs',
    exphbs({
        defaultLayout: 'main',
        extname: 'hbs',
        helpers: {
            json: function (context) {
                return JSON.stringify(context);
            },
        },
        partialsDir: __dirname + '/views/partials',
    })
);

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    const title = 'Welcome to our schedule website';
    res.render('index', { title });
});

app.get('/users', (req, res) => {
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

app.get('/users/new', (req, res) => {
    const title = 'Add a New User';
    res.render('formAddUser', { title });
});

app.post('/users', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

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
});

app.get('/users/:userId', (req, res) => {
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

app.get('/users/:userId/schedules', (req, res) => {
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
                    title = `${userSchedules[0].firstName} ${userSchedules[0].lastName}'s Schedules`;
                    if (userSchedules[0].scheduleId === null) {
                        message = `${userSchedules[0].firstName} does not have any schedules.`;
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

app.get('/schedules', (req, res) => {
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
            console.log('err inside get/schedules');
            console.log(err);
            res.render('/schedules', { title });
        });
});

app.get('/schedules/new', (req, res) => {
    const title = 'Add a New Schedule';

    const currentYear = new Date().getFullYear();

    const years = [currentYear];
    for (let i = 1; i < 5; i++) {
        const yearToPush = currentYear + i;
        years.push(yearToPush);
    }

    const dates = [];
    for (let i = 1; i <= 31; i++) {
        dates.push(i);
    }

    User.getUsers()
        .then((users) => {
            res.render('formAddSchedule', {
                title,
                users,
                dates,
                months,
                years,
            });
        })
        .catch((err) => {
            console.log('err inside get/schedules/new');
            console.log(err);
            res.render('/');
        });
});

app.post('/schedules', (req, res) => {
    const userId = parseInt(req.body.userId);
    const { day, month, year, startHour, startMinute, endHour, endMinute } =
        req.body;

    const startTime = new Date(year, month, day, startHour, startMinute);
    const endTime = new Date(year, month, day, endHour, endMinute);

    const newSchedule = {
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
    };

    Schedule.insertSchedule(newSchedule)
        .then(() => {
            res.redirect('/schedules');
        })
        .catch((err) => {
            console.log('err inside post/schedules');
            console.log(err);
            res.redirect('/schedules');
        });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
