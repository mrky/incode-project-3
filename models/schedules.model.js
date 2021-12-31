const con = require('../db/connect');

function getSchedules() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT user_id as userId, 
        DATE_FORMAT(schedules.start_time, '%a, %D  %b %Y') AS 'date', 
        DATE_FORMAT(schedules.start_time, '%k:%i') AS 'startTime', 
        DATE_FORMAT(schedules.end_time, '%k:%i') AS 'endTime' 
        FROM schedules;`;
        con.query(sql, (err, schedules) => {
            if (err) reject(err);

            resolve(schedules);
        });
    });
}

function getUserSchedules(userId) {
    return new Promise((resolve, reject) => {
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
            if (err) reject(err);

            resolve(userSchedules);
        });
    });
}

function insertSchedule(newSchedule) {
    return new Promise((resolve, reject) => {
        con.query('INSERT INTO schedules SET ?', newSchedule, (err, result) => {
            if (err) reject(err);

            resolve(result);
        });
    });
}

module.exports = { getSchedules, getUserSchedules, insertSchedule };
