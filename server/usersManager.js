const usersStorage = require("./storagePlugins/gcsStorage");

class UsersManager {
  constructor() {
    this._users = {};
  }

  getUser(email) {
    return this._users[email];
  }

  getUsersEmails() {
    return Object.keys(this._users);
  }

  async loadUsers() {
    // read al the verifiers from the blob and load them
    let usersData = await usersStorage.getAllUsers();
    usersData.forEach(userData => {
      if (userData) {
        this._users[userData.email] = userData;
      }
    });
  }

  async addUser(email, pluginData, arriveHour, departHour, reportingDays) {
    //Save to storage
    let result = await usersStorage.saveUser(email, pluginData, arriveHour, departHour, reportingDays);
    //Update memory
    this._users[email] = {
        pluginData,
        arriveHour,
        departHour,
        email,
        reportingDays
    };
  }

  async deleteUser(email) {
    delete this._users[email];
    return await usersStorage.deleteUser(email);
  }
}

module.exports = new UsersManager();
