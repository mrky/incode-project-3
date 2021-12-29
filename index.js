const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const port = 3002;
const crypto = require('crypto');
const mysql = require('mysql2');

require('dotenv').config();

const dayjs = require('dayjs');
const localeData = require('dayjs/plugin/localeData');
dayjs.extend(localeData);
const months = dayjs.months();

const dbConfig = require('./db/config');
const con = mysql.createConnection(dbConfig);

con.connect((err) => {
    if (err) throw err;
    console.log('Connected to database!');
});

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

    const sql =
        'SELECT user_id AS userId, first_name AS firstName, last_name AS lastName, email, password FROM users';
    con.query(sql, (err, users) => {
        if (err) throw err;

        res.render('users', {
            title,
            users,
            linkName: true,
            linkSchedules: false,
        });
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

    con.query('INSERT INTO users SET ?', newUser, (err, result) => {
        if (err) console.log(err);

        console.log(result);
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
        const sql = `SELECT user_id AS userId, first_name AS firstName, last_name AS lastName, email, password
        FROM users
        WHERE user_id = ?`;
        con.query(sql, userId, (err, user) => {
            if (err) console.log(err);

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
        });
    }
});

app.get('/users/:userId/schedules', (req, res) => {
    const userId = parseInt(req.params.userId);

    let title = 'User does not exist';

    if (isNaN(userId)) {
        res.render('schedules', { title });
    } else {
        const sql = `SELECT users.user_id AS userId, 
        schedules.schedule_id as scheduleId, 
        DATE_FORMAT(schedules.start_time, '%a, %D  %b %Y') AS 'date', 
        DATE_FORMAT(schedules.start_time, '%k:%i') AS 'startTime', 
        DATE_FORMAT(schedules.end_time, '%k:%i') AS 'endTime', 
        users.first_name AS firstName, 
        users.last_name AS lastName 
        FROM schedules 
        RIGHT JOIN users 
        ON schedules.user_id = users.user_id 
        WHERE users.user_id = ?;`;
        con.query(sql, userId, (err, userSchedules) => {
            if (err) console.log(err);

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
        });
    }
});

app.get('/schedules', (req, res) => {
    const title = 'All Schedules';
    const sql = `SELECT user_id as userId, 
        DATE_FORMAT(schedules.start_time, '%a, %D  %b %Y') AS 'date', 
        DATE_FORMAT(schedules.start_time, '%k:%i') AS 'startTime', 
        DATE_FORMAT(schedules.end_time, '%k:%i') AS 'endTime' 
        FROM schedules;`;
    con.query(sql, (err, schedules) => {
        if (err) throw err;

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

    con.query(
        'SELECT user_id AS userId, first_name AS firstName, last_name as lastName FROM users',
        (err, users) => {
            if (err) throw err;

            res.render('formAddSchedule', {
                title,
                users,
                dates,
                months,
                years,
            });
        }
    );
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

    con.query('INSERT INTO schedules SET ?', newSchedule, (err, result) => {
        if (err) console.log(err);

        res.redirect('/schedules');
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
