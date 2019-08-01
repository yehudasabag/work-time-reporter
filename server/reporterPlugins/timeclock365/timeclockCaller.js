const logger = require("winston-module-logger");
const log = logger.getLogger(require("path").basename(__filename));
const cypress = require("cypress");
const arrivalSpec = "./cypress/integration/reportArrival.js";
const departureSpec = "./cypress/integration/reportDeparture.js";

class TimeclockCaller {
  static async reportArrival(email, pass) {
    log.info("Trying to report arrival using cypress...");
    const result = await cypress.run({
      env: {
        email,
        pass
      },
      spec: arrivalSpec,
      record: false
    });
    if (result.runs[0].tests[0].state === 'failed') {
      // the automation failed
      log.error(JSON.stringify(result));
      return { error: `Failed to report arrival: ${result.runs[0].error}` };
    }
    log.info("Successfully reported arrival using cypress");
    return {};
  }

  static async reportDeparture(email, pass) {
    log.info("Trying to report departure using cypress...");
    const result = await cypress.run({
      env: {
        email,
        pass
      },
      spec: departureSpec,
      record: false
    });
    if (result.runs[0].tests[0].state === 'failed') {
      // the automation failed
      log.error(JSON.stringify(result));
      return { error: `Failed to report departure: ${result.runs[0].error}` };
    }
    log.info("Successfully reported departure using cypress");
    return {};
  }
}

TimeclockCaller.pluginName = "Timeclock365";

module.exports = TimeclockCaller;

TimeclockCaller.reportArrival();
