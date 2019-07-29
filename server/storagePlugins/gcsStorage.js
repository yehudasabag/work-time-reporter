const logger = require("winston-module-logger");
const log = logger.getLogger(require("path").basename(__filename));
const { Storage } = require("@google-cloud/storage");
const bucketName = "work-time-reporter-users";
const excludedDatesFileName = "excludedDates";

class GcsStorage {
  constructor() {
    this._storage = new Storage();
  }

  async createContainer() {
    // Get all buckets from the cloud storage.
    const [buckets] = await this._storage.getBuckets();

    // Check if the bucket with the given name (bucketName) already exists
    const bucket = buckets.find(bucket => bucket.name === bucketName);

    if (bucket) {
      this._bucket = bucket;
    } else {
      // If the bucket doesn't exist, create it.
      log.info(`Creating new bucket: "${bucketName}"...`);
      const result = await this._storage.createBucket(bucketName);
      log.info(`Bucket successfully created.`);
      this._bucket = result;
    }
  }

  async saveUser(email, pass, arriveHour, departHour, reportingDays) {
    const userFile = this._bucket.file(email);
    await userFile.save(
      JSON.stringify({
        email,
        pass,
        arriveHour,
        departHour,
        reportingDays
      })
    );
    console.log(`Successfully saved user ${email}`);
  }

  async deleteUser(email) {
    const userFile = this._bucket.file(email);
    await userFile.delete();
    log.info(`Successfully deleted user ${email}`);
  }

  async getAllUsers() {
    const usersFiles = (await this._bucket.getFiles())[0];
    let users = [];
    usersFiles.forEach(file => {
      if (file.name === excludedDatesFileName) return;
      users.push(
        new Promise(async resolve => {
          try {
            let content = (await file.download())[0];
            let user = JSON.parse(content);
            resolve(user);
          } catch (error) {
            log.error(`Failed to read user ${file.name}: ${error.message}`, error);
            resolve(); // resolve anyway for the Promise.all
          }
        })
      );
    });
    return await Promise.all(users);
  }

  async saveDates(dates) {
    const datesFile = this._bucket.file(excludedDatesFileName);
    try {
      await datesFile.save(
        JSON.stringify({
          excludedDates: dates
        })
      );
      log.info(`Successfully saved excluded dates ${dates}`);
      return dates;
    } catch (e) {
      const msg = `Failed to save excluded dates ${dates}: ${e.message}`;
      log.error(msg, e);
      throw new Error(msg);
    }
  }

  async getDates() {
    const datesFile = this._bucket.file(excludedDatesFileName);
    const datesFileExists = (await datesFile.exists())[0];
    if (datesFileExists) {
      try {
        let content = (await datesFile.download())[0];
        log.debug(`got ${excludedDatesFileName}: ${content}`);
        let dates = JSON.parse(content);
        return dates.excludedDates;
      } catch (error) {
        log.error(`Failed to get excluded dates: ${error.message}`, error);
        throw new Error(`Failed to get excluded dates: ${error.message}`);
      }
    } else {
      await this.saveDates([]);
    }
  }
}

let gs = new GcsStorage();
module.exports = gs;
