const storage = require("./storagePlugins/gcsStorage");

class DatesExcluder {
  constructor() {
    this._dates = [];
  }

  async saveDates(dates) {
    this._dates = await storage.saveDates(dates);
    return this._dates;
  }

  async getDates() {
    this._dates = await storage.getDates();
    return this._dates;
  }

  isExcluded(date) {
    if (this._dates.length) {
      return this._dates.includes(date);
    }
    return false;
  }
}

module.exports = new DatesExcluder();
