

const axios = require('axios');
const settings = require('./settings');

let postToIsufit = async function (isufitNum, projectId, mesimaID, st) {
    if (settings.doNotPostInDebug) {
        return { message: `skipping real post in debug` };
    }

    try {
        let post = {
            Card: isufitNum,
            ProjectID: projectId, //"1",
            MesimaID: mesimaID,//"0",
            st: st //2
        };
        let res = await axios.post(settings.isufitUrl, post);
        console.log(`Request to isufit: ${JSON.stringify(post)}`);
        console.log(`Response from isufit: ${JSON.stringify(res.data)}`);
        return { error: !res.data.isOK, message: res.data.notes.join() };
    }
    catch (ex) {
        console.log(`IsufitCaller:postToIsufit - Failed to post ${ex.stack}`);
        return { error: true, message: ex.message };
    }
};

let postArrival = async function (isufitNum) {
    // request:
    //http://ranad.co/biocatchclock/IsufitWS.asmx/AddMove
    //{"Card":"46","ProjectID":"1","MesimaID":"0","st":2}

    // response:
    //{"__type":"IsufitWS+AddMoveResRec",
    // "isOK":true,
    // "notes":["נוכחות של סבאג יהודה בשעה 25/12/2017 18:12"," כניסה לפרויקט 1 משימה 0","הנתונים נקלטו בהצלחה."]}
    console.log('postArrival');
    return await postToIsufit(isufitNum, "1", "0", 2);
};

let postDeparture = async function (isufitNum) {
    //{"Card":"46","ProjectID":"9999","MesimaID":"0","st":1}
    //{"__type":"IsufitWS+AddMoveResRec","isOK":true,"notes":["נוכחות של סבאג יהודה בשעה 25/12/2017 18:28","יציאה רגילה","הנתונים נקלטו בהצלחה."]}

    console.log('postDeparture');
    return await postToIsufit(isufitNum, "9999", "0", 1);
};

module.exports = {
    postArrival: postArrival,
    postDeparture: postDeparture
};