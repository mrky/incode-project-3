const mysql = require('mysql2');

const dbConfig = require('./config');
const con = mysql.createConnection(dbConfig);

con.connect((err) => {
    if (err) throw err;
    console.log('Connected to database!');
});

module.exports = con;