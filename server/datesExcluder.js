
const settings = require('./settings');
const storage = require('azure-storage');
const moment = require('moment');


class DatesExcluder {
    constructor(){
        this._container = settings.usersStorage.containerName;
        this._blobSrvc = storage.createBlobService(settings.usersStorage.storageAccount,
            settings.usersStorage.storageKey);
        this._dates = [];
    }

    saveDates(dates) {
        return new Promise((resolve, reject) => {
            this._blobSrvc.createBlockBlobFromText(this._container, settings.excludedDatesFileName,
                JSON.stringify({
                    excludedDates: dates
                }), (error, result) => {
                    if (error) {
                        console.log(`Failed to save excluded dates ${dates}: ${error}`);
                        reject(error);
                    }
                    else {
                        console.log(`Successfully saved excluded dates ${dates}`);
                        this._dates = dates;
                        resolve(result);
                    }
                });
        });
    }

    getDates() {
        return new Promise((resolve, reject) => {
            this._blobSrvc.getBlobProperties(
                this._container,
                settings.excludedDatesFileName,
                (err, properties, status) => {
                    if (err) {
                        reject({error: true, message: err.message});
                    }
                    else if (status.isSuccessful) {
                        this._blobSrvc.getBlobToText(this._container, settings.excludedDatesFileName, (err, blobContent) => {
                            if (err) {
                                console.error(`Failed to read blob ${settings.excludedDatesFileName}`);
                                reject({error: true, message: err.message});
                            }
                            else {
                                console.log(`got ${settings.excludedDatesFileName}: ${blobContent}`);
                                try {
                                    let blob = JSON.parse(blobContent);
                                    this._dates = blob.excludedDates;
                                    resolve(this._dates);
                                }
                                catch (ex) {
                                    console.error(`Failed to parse ${blobContent}`);
                                    reject({error: true, message: ex.message});
                                }
                            }
                        });
                    }
                    else {
                        console.log('excludedDates file does not exist in storage, no date will be excluded');
                        resolve(this._dates);
                    }
                });
        });
    }

    isExcluded(date) {
        if (this._dates.length) {
            return this._dates.includes(date);
        }
        return false;
    }
}

module.exports = new DatesExcluder();