const con = require('../db/connect');

function login(email, password) {
    const sql =
        'SELECT user_id AS userId, first_name AS firstName, last_name AS lastName, email FROM users WHERE email = ? AND password = ?';
    return new Promise((resolve, reject) => {
        con.query(sql, [email, password], (err, user) => {
            if (err) reject(err);

            resolve(user);
        });
    });
}

function getUsers() {
    const sql =
        'SELECT user_id AS userId, first_name AS firstName, last_name AS lastName, email, password FROM users';
    return new Promise((resolve, reject) => {
        con.query(sql, (err, users) => {
            if (err) reject(err);

            resolve(users);
        });
    });
}

function getUserById(userId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT user_id AS userId, first_name AS firstName, last_name AS lastName, email, password
        FROM users
        WHERE user_id = ?`;
        con.query(sql, userId, (err, user) => {
            if (err) reject(err);

            resolve(user);
        });
    });
}

function insertUser(newUser) {
    return new Promise((resolve, reject) => {
        con.query('INSERT INTO users SET ?', newUser, (err, result) => {
            if (err) reject(err);

            resolve(result.insertId);
        });
    });
}

module.exports = { login, getUsers, getUserById, insertUser };
