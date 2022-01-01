const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const port = 3002;

require('dotenv').config();

const indexRouter = require('./routes/index.route');
const userRouter = require('./routes/users.route');
const scheduleRouter = require('./routes/schedules.route');

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

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/schedules', scheduleRouter);

/* app.get('/', (req, res) => {
    const title = 'Welcome to our schedule website';
    res.render('index', { title });
}); */

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
