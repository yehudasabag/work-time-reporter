const logger = require("winston-module-logger");
const log = logger.getLogger(require("path").basename(__filename));
const schedule = require("node-schedule");
const emailSender = require("./emailSender");
const datesExcluder = require("./datesExcluder");
const moment = require("moment");
const TimeclockCaller = require("./reporterPlugins/timeclock365/timeclockCaller");
const REPORT_TYPE = {
  ARRIVAL: "arrival",
  DEPARTURE: "departure"
};

class ReportScheduler {
  constructor(reportPlugin) {
    this._scheduledJobs = {};
    this._reportPlugin = reportPlugin;
  }

  // The reporting days default value is for users created before i added support for this feature
  scheduleUserReporting(email, pluginData, arrivalTime, departTime, reportingDays = [0, 1, 2, 3, 4]) {
    let onSchedule = reportAction => {
      // check if this day is excluded by the admin (non working day outside of friday and saturday)
      let currDate = moment().format("DD/MM/YYYY");
      if (datesExcluder.isExcluded(currDate)) {
        log.info(`excluding report for ${email} since the ${currDate} is excluded`);
        return;
      }

      // this function supposed to be called in the beginning of the given hour, so now we random the minutes
      setTimeout(async () => {
        log.info(
          `Calling to reporter ${reportAction} for ${email}, ${pluginData} on ${new Date().toISOString()}`
        );
        const reportActionFunc = reportAction === REPORT_TYPE.ARRIVAL ? "reportArrival" : "reportDeparture";
        try {
          await this._reportPlugin[reportActionFunc](email, pluginData);
          let msg = `Successfully reported ${
            this._reportPlugin.name
          } ${reportAction} for ${email} on ${new Date().toISOString()}`;
          console.log(msg);
          emailSender.sendEmail(
            msg,
            email,
            `Successfully reported ${this._reportPlugin.name} ${reportAction}, you can ignore this email`
          );
        } catch (err) {
          let msg = `Failed reporting ${
            this._reportPlugin.name
          } ${reportAction} for ${email} on ${new Date().toISOString()}: ${res.message}`;
          console.log(msg);
          msg += ` You should report ${this._reportPlugin.name} ${reportAction} manually today... :(`;
          emailSender.sendEmail(
            msg,
            email,
            `Failed to report ${this._reportPlugin.name} ${reportAction} !!!`
          );
        }
      }, Math.random() * 59 * 60 * 1000);
    };
    // in case the user is already scheduled
    this.clearUserSchedule(email);

    // change the reporting days of the user from [0,1,..] to a string matching cron format
    let days = reportingDays.join();

    // schedule arrival
    let jArrival = this._scheduleReport(arrivalTime, days, onSchedule.bind(this, REPORT_TYPE.ARRIVAL));
    this._scheduledJobs[email] = { arrivalJob: jArrival };
    // this._scheduledJobs[email] = {};

    // schedule departure
    let jDepart = this._scheduleReport(departTime, days, onSchedule.bind(this, REPORT_TYPE.DEPARTURE));
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
    // return schedule.scheduleJob(`0 59 * * * *`, onSchedule);
  }
}

module.exports = new ReportScheduler(TimeclockCaller);
