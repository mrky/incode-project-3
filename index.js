const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const port = 3002;
const { users, schedules } = require('./data');
const crypto = require('crypto');
const formatTime = require('./utils/formatTime');

const days = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday',
};

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
    res.render('users', { title, users, linkName: true, linkSchedules: true });
});

app.get('/users/new', (req, res) => {
    const title = 'Add a New User';
    res.render('formAddUser', { title });
});

app.post('/users', (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('base64');

    const newUser = {
        firstname,
        lastname,
        email,
        password: hashedPassword,
    };

    users.push(newUser);

    res.redirect('/users');
});

app.get('/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (userId < users.length) {
        const title = `${users[userId].firstname} ${users[userId].lastname}'s Profile`;
        res.render('users', {
            title,
            users: [users[userId]],
            userId,
            linkName: false,
            linkSchedules: true,
        });
    } else {
        const title = 'User does not exist';
        res.render('users', {
            title,
            users: null,
            linkName: false,
            linkSchedules: false,
        });
    }
});

app.get('/users/:userId/schedules', (req, res) => {
    const userId = parseInt(req.params.userId);

    if (userId < users.length) {
        let userSchedules = schedules.filter((currentObj) => {
            return currentObj.user_id === userId;
        });

        const title = `${users[userId].firstname} ${users[userId].lastname}'s Schedules`;
        let message;
        if (userSchedules.length === 0) {
            message = `${users[userId].firstname} does not have any schedules.`;
        }
        res.render('schedules', {
            title,
            schedules: userSchedules,
            days,
            message,
        });
    } else {
        const title = 'User does not exist';
        res.render('schedules', { title });
    }
});

app.get('/schedules', (req, res) => {
    const title = 'All Schedules';
    res.render('schedules', { title, schedules, days });
});

app.get('/schedules/new', (req, res) => {
    const title = 'Add a New Schedule';
    res.render('formAddSchedule', { title, users });
});

app.post('/schedules', (req, res) => {
    const userId = parseInt(req.body.userId);
    const day = parseInt(req.body.day);
    const { startAt, endAt } = req.body;

    const startAtFormatted = formatTime(startAt);
    const endAtFormatted = formatTime(endAt);

    const newSchedule = {
        user_id: userId,
        day,
        start_at: startAtFormatted,
        end_at: endAtFormatted,
    };

    schedules.push(newSchedule);

    res.redirect('/schedules');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
