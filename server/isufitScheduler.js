"use strict";

const schedule = require('node-schedule');
const isufitCaller = require('./isufitCaller');
const emailSender = require('./emailSender');
const datesExcluder = require('./datesExcluder');
const moment = require('moment');

class IsufitScheduler {
    constructor() {
        this._scheduledJobs = {};
    }

    // The reporting days default value is for users created before i added support for this feature
    scheduleUserReporting(email, isufitNum, arrivalTime, departTime, reportingDays = [0, 1, 2, 3, 4]) {
        let onSchedule = (isufitAction, isufitActionFunc) => {
            // check if this day is excluded by the admin (non working day outside of friday and saturday)
            let currDate = moment().format('DD/MM/YYYY');
            if (datesExcluder.isExcluded(currDate)) {
                console.log(`excluding report for ${email} since the ${currDate} is excluded`);
                return;
            }

            // this function supposed to be called in the beginning of the given hour, so now we random the minutes
            setTimeout(async () => {
                console.log(`Calling to isufit ${isufitAction} for ${email}, ${isufitNum} on ${new Date().toISOString()}`);
                let res = await isufitActionFunc(isufitNum);
                if (res.error) {
                    let msg = `Failed reporting isufit ${isufitAction} for ${email} on ${new Date().toISOString()}: ${res.message}`;
                    console.log(msg);
                    msg += ` You should report ${isufitAction} manually today... :(`;
                    emailSender.sendEmail(msg, email, 'Failed to report Isufit !!!');
                }
                else {
                    let msg = `Successfully reported isufit ${isufitAction} for ${email} on ${new Date().toISOString()}: ${res.message}`;
                    console.log(msg);
                    emailSender.sendEmail(msg, email, 'Successfully reported Isufit, you can ignore this email');
                }
            }, Math.random() * 59 * 60 * 1000);
        };
        // in case the user is already scheduled
        this.clearUserSchedule(email);

        // change the reporting days of the user from [0,1,..] to a string matching cron format
        let days = reportingDays.join();

        // schedule arrival
        let jArrival = this._scheduleReport(arrivalTime, days,  onSchedule.bind(null, 'arrival', isufitCaller.postArrival));
        this._scheduledJobs[email] = { arrivalJob: jArrival };

        // schedule departure
        let jDepart = this._scheduleReport(departTime, days, onSchedule.bind(null, 'departure', isufitCaller.postDeparture));
        this._scheduledJobs[email].departJob = jDepart;
    }

    clearUserSchedule(email) {
        if (this._scheduledJobs[email]) {
            // The user already scheduled so cancel the current jobs and create new ones
            this._scheduledJobs[email].arrivalJob && this._scheduledJobs[email].arrivalJob.cancel();
            this._scheduledJobs[email].departJob && this._scheduledJobs[email].departJob.cancel();
            this._scheduledJobs[email] = null;
        }
    }

    _scheduleReport(hour, days, onSchedule) {
        return schedule.scheduleJob(`0 0 ${hour} * * ${days}`, onSchedule);
        // return schedule.scheduleJob(`0 12 16 * * 0,3,4`, onSchedule);
    }
}

module.exports = new IsufitScheduler();