const express = require('express');
const router = express.Router();
const usersManager = require('./usersManager');
const isufitScheduler = require('./isufitScheduler');
const datesExcluder = require('./datesExcluder');



router.post('/register', async (req, res) => {
    console.log('/register');
    let body = req.body;
    let email = body.email;
    let isufitNum = body.isufitNum;
    let arriveHour = body.arriveHour || 9;
    let departHour = body.departHour || 18;
    let reportingDays = body.reportingDays || [0, 1, 2, 3, 4];
    if (!email || !isufitNum) {
        res.json({error: true, message: 'You must provide email and isufit card number'});
        return;
    }
    if (arriveHour > 24 || arriveHour < 0 || departHour > 24 || departHour < 0) {
        res.json({error: true, message: 'You must provide arriveHour and departHour between 0 to 24'});
        return;
    }

    try {
        // save the user to a blob
        await usersManager.addUser(email, isufitNum, arriveHour, departHour, reportingDays);
        // schedule the user report

        isufitScheduler.scheduleUserReporting(email, isufitNum, arriveHour, departHour, reportingDays);
        console.log(`Scheduled isufit report for ${email} between ${arriveHour} to ${departHour}`);
        res.json({});
    }
    catch (ex) {
        console.log(`/register, failed to addUser: ${ex.stack}`);
        res.json({error:true, message: ex.message});
    }
});

router.post('/unregister', async (req, res) => {
    console.log('/unregister');
    let body = req.body;
    let email = body.email;
    if (!email) {
        res.json({error: true, message: 'You must provide email'});
        return;
    }

    try {
        // delete the user's blob
        await usersManager.deleteUser(email);
        // cancel the report schedule
        isufitScheduler.clearUserSchedule(email);
        console.log(`Cleared isufit automation for ${email}`);
        res.json({});
    }
    catch (ex) {
        console.log(`/unregister, failed to delete user: ${ex.stack}`);
        res.json({error:true, message: ex.message});
    }

});

router.post('/excludeDates', async (req, res) => {
    console.log('/excludeDates');
    let body = req.body;
    let excludedDates = body.excludedDates;
    if (!excludedDates) {
        res.json({error: true, message: 'You must provide excludeDates'});
        return;
    }

    try {
        await datesExcluder.saveDates(excludedDates);
        console.log(`Excluded reporting dates for ${excludedDates}`);
        res.json({});
    }
    catch (ex) {
        console.log(`/excludeDates, failed to exclude dates: ${ex.stack}`);
        res.json({error:true, message: ex.message});
    }

});

router.get('/getExcludedDates', async (req, res) => {
    console.log('/getExcludedDates');
    try {
        let dates = await datesExcluder.getDates();
        res.json({ excludedDates: dates });
    }
    catch (ex) {
        console.log(`/getExcludedDates, failed to get dates: ${ex.stack}`);
        res.json({error:true, message: ex.message});
    }

});

module.exports = router;