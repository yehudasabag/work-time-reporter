const logger = require("winston-module-logger");
const log = logger.getLogger(require("path").basename(__filename));

class TimeclockCaller {
  static reportArrival() {
    log.info("timeclock report arrival");
    return {};
  }

  static reportDeparture() {
    log.info("timeclock report departure");
    return {};
  }
}

TimeclockCaller.pluginName = "Timeclock365";

module.exports = TimeclockCaller;
