"use strict";
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const registerRouter = require('./registerRoutes');
const settings = require('./settings');
const usersStorage = require('./usersStorage');
const usersManager = require('./usersManager');
const isufitScheduler = require('./isufitScheduler');
const datesExcluder = require('./datesExcluder');

const path = require('path');

app.use(express.static(path.join(__dirname, '/../isufit-auto-ui/build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/../isufit-auto-ui/build', 'index.html'));
});


app.use(bodyParser.json());

app.use('/', registerRouter);

usersStorage.createContainer()
    .then(() => {
        datesExcluder.getDates()
            .then((dates) => {
                console.log(`loaded excluded dates from storage ${dates} ...`);
                usersManager.loadUsers()
                    .then(() => {
                        console.log('loaded all users from storage, scheduling any existing users...');
                        let usersEmails = usersManager.getUsersEmails();
                        for (let email of usersEmails) {
                            let userData = usersManager.getUser(email);
                            isufitScheduler.scheduleUserReporting(email, userData.isufitNum, userData.arriveHour, userData.departHour, userData.reportingDays);
                        }
                        app.listen(settings.port);
                        console.log(`Isufit server is listening on port ${settings.port}...`);
                    })
                    .catch(err => {
                        console.log(`Failed to load users from storage: ${err.message}`);
                        process.exit(1);
                    });
            })
            .catch(ex => {
                console.log(`Failed to load excluded dates: ${ex.message}`);
                process.exit(1);
            });
    })
    .catch(err => {
        console.log(`Failed to create users container in storage: ${err.message}`);
        process.exit(1);
    });


