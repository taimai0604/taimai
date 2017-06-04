'use strict';
var accessToken = "123";
var test = require("./test");
module.exports = function (Config) {
    //get accessToken
    Config.getAccessToken = function (cb) {
        accessToken = "789";
        test.setAccessToken(accessToken);
        cb(null, accessToken);
    }

    Config.remoteMethod(
        'getAccessToken',
        {
            http: { path: '/getAccessToken', verb: 'get' },
            returns: { arg: 'accessToken', type: 'string' },
        }
    );
};
