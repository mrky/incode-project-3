const express = require('express');
const app = express();
const port = 3000;
const { users, schedules } = require('./data');
const crypto = require('crypto');

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('Welcome to our schedule website');
});

app.get('/users', (req, res) => {
    res.json(users);
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

    res.json(newUser);
});

app.get('/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    if (userId < users.length) {
        res.json(users[userId]);
    } else {
        res.send('User does not exist');
    }
});

app.get('/users/:userId/schedules', (req, res) => {
    const userId = parseInt(req.params.userId);

    if (userId < users.length) {
        let userSchedules = schedules.filter((currentObj) => {
            return currentObj.user_id === userId;
        });

        if (userSchedules.length !== 0) {
            res.json(userSchedules);
        } else {
            res.send(
                users[userId].firstname +
                    ' ' +
                    users[userId].lastname +
                    ' does not have any schedules.'
            );
        }
    } else {
        res.send('User does not exist');
    }
});

app.get('/schedules', (req, res) => {
    res.json(schedules);
});

app.post('/schedules', (req, res) => {
    const userId = parseInt(req.body.user_id);
    const day = parseInt(req.body.day);
    const startAt = req.body.start_at;
    const endAt = req.body.end_at;

    const newSchedule = {
        user_id: userId,
        day,
        start_at: startAt,
        end_at: endAt,
    };

    schedules.push(newSchedule);

    res.json(newSchedule);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
