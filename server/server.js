const settings = require("./settings");
const logger = require("winston-module-logger");
logger.init(settings.logLevel);

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const registerRouter = require("./registerRoutes");
const usersStorage = require("./storagePlugins/gcsStorage");
const usersManager = require("./usersManager");
const isufitScheduler = require("./reportScheduler");
const datesExcluder = require("./datesExcluder");

const path = require("path");
const log = require("winston-module-logger").getLogger(require("path").basename(__filename));

app.use(express.static(path.join(__dirname, "/../build")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "/../build", "index.html"));
});

app.use(bodyParser.json());

app.use("/", registerRouter);

usersStorage
  .createContainer()
  .then(() => {
    datesExcluder
      .getDates()
      .then(dates => {
        log.info(`loaded excluded dates from storage ${dates} ...`);
        usersManager
          .loadUsers()
          .then(() => {
            log.info("loaded all users from storage, scheduling any existing users...");
            let usersEmails = usersManager.getUsersEmails();
            for (let email of usersEmails) {
              let userData = usersManager.getUser(email);
              isufitScheduler.scheduleUserReporting(
                email,
                userData,
                userData.arriveHour,
                userData.departHour,
                userData.reportingDays
              );
            }
            app.listen(settings.port);
            log.info(`Work time reporter server is listening on port ${settings.port}...`);
          })
          .catch(err => {
            log.error(`Failed to load users from storage: ${err.message}`, err);
            process.exit(1);
          });
      })
      .catch(ex => {
        log.error(`Failed to load excluded dates: ${ex.message}`, ex);
        process.exit(1);
      });
  })
  .catch(err => {
    console.log(`Failed to create users container in storage: ${err.message}`);
    process.exit(1);
  });
