const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedules.model');
const User = require('../models/users.model');

// use dayjs to generate a list of months to use in formAddSchedule
const dayjs = require('dayjs');
const localeData = require('dayjs/plugin/localeData');
dayjs.extend(localeData);
const months = dayjs.months();

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
            console.log('err inside get/schedules');
            console.log(err);
            res.render('/schedules', { title });
        });
});

router.get('/new', (req, res) => {
    const title = 'Add a New Schedule';

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
            res.redirect('/');
        });
});

router.post('/', (req, res) => {
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

module.exports = router;
