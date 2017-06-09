var tm = require("../../common/models/tm");
var accessToken = "3e17a2f5f6c1cd55310c83e62d1546d91d32dac1";
var timeDelay = 30000;
module.exports = function (app) {
    tm.setAccessToken(accessToken);
    console.log(tm.getAccessToken());

    tm.setTimeDelay(timeDelay);
    console.log(tm.getTimeDelay());
};