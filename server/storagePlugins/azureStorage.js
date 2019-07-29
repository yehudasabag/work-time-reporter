const storage = require('azure-storage');
const settings =  { 
    usersStorage: {
        usersContainerName: process.env.USERS_CONTAINER || "work-time-reporter-users",
        storageAccount: process.env.USERS_STORAGE_ACCOUNT,
        storageKey: process.env.USERS_STORAGE_KEY
    },
    excludedDatesFileName: process.env.EXCLUDED_DATES_FILENAME || "excludedDates"
};

class AzureStorage {
    constructor(){
        this._container = settings.usersStorage.containerName;
        this._blobSrvc = storage.createBlobService(settings.usersStorage.storageAccount,
            settings.usersStorage.storageKey);
    }

    createContainer() {
        return new Promise((resolve, reject) => {
            this._blobSrvc.createContainerIfNotExists(this._container, {
                publicAccessLevel: 'blob'
            }, function(error, result) {
                if (!error) {
                    if (result) {
                        console.log('users container created');
                    }
                    else {
                        console.log('users container already exist');
                    }
                    resolve();
                }
                else {
                    console.error('Failed to create users container');
                    reject(error);
                }
            });
        });
    }

    saveUser(email, isufitNum, arriveHour, departHour, reportingDays) {
        return new Promise((resolve, reject) => {
            this._blobSrvc.createBlockBlobFromText(this._container, email,
                JSON.stringify({ email: email,
                    isufitNum: isufitNum,
                    arriveHour: arriveHour,
                    departHour: departHour,
                    reportingDays: reportingDays
                }), (error, result) => {
                    if (error) {
                        console.log(`Failed to save user ${email}: ${error}`);
                        reject(error);
                    }
                    else {
                        console.log(`Successfully saved user ${email}`);
                        resolve(result);
                    }
                });
        });
    }

    deleteUser(email) {
        return new Promise((resolve, reject) => {
            this._blobSrvc.deleteBlob(this._container, email, (err, result) => {
                if (err) {
                    console.log(`Failed to delete user ${email}: ${err}`);
                    reject(err);
                }
                else {
                    console.log(`Successfully deleted user ${email}`);
                    resolve(result);
                }
            });
        });
    }

    _getAllUsersBlobs() {
        return new Promise((resolve, reject) => {

            let containerName = this._container;

            let blobs = [];
            let aggregateBlobs = (err, result, cb) => {
                if (err) {
                    cb(err);
                } else {
                    blobs = blobs.concat(result.entries);
                    if (result.continuationToken !== null) {
                        this._blobSrvc.listBlobsSegmented(
                            containerName,
                            result.continuationToken,
                            aggregateBlobs);
                    } else {
                        cb(null, blobs);
                    }
                }
            };

            this._blobSrvc.listBlobsSegmented(containerName, null, (err, result) => {
                aggregateBlobs(err, result, (err, blobs) => {
                    if (err) {
                        console.error(`Failed to list blobs: ${err}`);
                        reject(err);
                    } else {
                        console.log(`Founds blobs: ${JSON.stringify(blobs)}`);
                        resolve(blobs);
                    }
                });
            });
        });
    }

    async getAllUsers() {
        let blobs = await this._getAllUsersBlobs();
        let users = [];
        blobs.forEach((blob) => {
            if (blob.name === settings.excludedDatesFileName) return;
            let blobToTextPromise = new Promise((resolve, reject) => {
                this._blobSrvc.getBlobToText(this._container, blob.name, (err, blobContent) => {
                    if (err) {
                        console.error(`Failed to read blob ${blob.name}`);
                        resolve();// resolve anyway for the Promise.all
                    }
                    else {
                        console.log(`got ${blob.name}: ${blobContent}`);
                        try {
                            let blob = JSON.parse(blobContent);
                            resolve(blob);
                        }
                        catch (ex) {
                            console.error(`Failed to parse ${blobContent}`);
                            resolve();// resolve anyway for the Promise.all
                        }
                    }
                });
            });
            users.push(blobToTextPromise);
        });
        return await Promise.all(users);
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
                        resolve(dates);
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
                                    resolve(blob.excludedDates);
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

}

let us = new AzureStorage();
module.exports = us;

