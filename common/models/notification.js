'use strict';
var PubNub = require('pubnub')
module.exports = function (Notification) {
    var pubnub = new PubNub({
        subscribeKey: "sub-c-c8dbb904-57bc-11e7-af75-02ee2ddab7fe",
        publishKey: "pub-c-cd864c3f-3537-4adb-95d0-40c3fb8116bb"
    })

    Notification.pub = function (channel, content, cb) {

        var publishConfig = {
            channel: channel,
            message: content
        }
        pubnub.publish(publishConfig, function (status, response) {
            console.log("channel : " + channel);
            console.log("pub message : " + content);
            // console.log(status, response);
        })
        cb(null, true);
    }

    Notification.remoteMethod(
        'pub',
        {
            http: { path: '/pub', verb: 'get' },
            accepts:
            [
                { arg: 'channel', type: 'string', http: { source: 'query' } },
                { arg: 'content', type: 'string', http: { source: 'query' } }
            ],
            returns: { type: 'boolean', root: true },
        }
    );
};
