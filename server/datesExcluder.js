
const storage = require('./storagePlugins/gcsStorage');

class DatesExcluder {
    constructor(){
        this._dates = [];
    }

    async saveDates(dates) {
        this._dates = await storage.saveDates(dates);
    }

    async getDates() {
        this._dates = await storage.getDates();
    }

    isExcluded(date) {
        if (this._dates.length) {
            return this._dates.includes(date);
        }
        return false;
    }
}

module.exports = new DatesExcluder();