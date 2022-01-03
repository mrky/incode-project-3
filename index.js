const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const cookieParser = require('cookie-parser');
const port = 3002;

require('dotenv').config();

const indexRouter = require('./routes/index.route');
const userRouter = require('./routes/users.route');
const scheduleRouter = require('./routes/schedules.route');

const { requireAuth } = require('./controllers/auth.controller');

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
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', requireAuth, userRouter);
app.use('/schedules', requireAuth, scheduleRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
