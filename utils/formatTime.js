/**
 * Comvert 24-hour time to 12-hour format
 * @param  {String} time 24-hour time in the format of HH:MM
 * @return {String}      12-hour version of the time in the format H:MMtt
 */
function formatTime(time) {
    const timeSplit = time.split(':');

    console.log('time input', time);
    console.log('time split', timeSplit);

    let timeMinutes;

    timeSplit[1] === '00'
        ? (timeMinutes = '')
        : (timeMinutes = ':' + timeSplit[1]);

    let timeHour;
    let returnTime;

    if (timeSplit[0] > 12) {
        timeHour = timeSplit[0] - 12;
        returnTime = timeHour + timeMinutes + 'PM';
    } else if (timeSplit[0] === '12') {
        timeHour = timeSplit[0];
        returnTime = timeHour + timeMinutes + 'PM';
    } else if (timeSplit[0] === '00') {
        timeHour = 12;
        returnTime = timeHour + timeMinutes + 'AM';
    } else {
        timeHour = timeSplit[0] / 1;
        returnTime = timeHour + timeMinutes + 'AM';
    }

    return returnTime;
}

module.exports = formatTime;
