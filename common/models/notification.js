'use strict';
var PubNub = require('pubnub')
module.exports = function (Notification) {
    var pubnub = new PubNub({
        subscribeKey: "sub-c-c8dbb904-57bc-11e7-af75-02ee2ddab7fe",
        publishKey: "pub-c-cd864c3f-3537-4adb-95d0-40c3fb8116bb"
    })

    //pub
    Notification.publish = function (data, cb) {
        var publishConfig = {
            channel: data.channel+"-"+data.deviceIdParticle,
            message: data.content
        }
        pubnub.publish(publishConfig, function (status, response) {
            console.log("channel : " + data.channel+"-"+data.deviceIdParticle);
            console.log("pub message : " + data.content);
        })
        cb(null, true);
    }

    Notification.remoteMethod(
        'publish',
        {
            http: { path: '/publish', verb: 'post' },
            accepts:
            { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { type: 'boolean', root: true },
        }
    );

    // sub
    Notification.sub = function (channel, cb) {
        pubnub.addListener({
            status: function (statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    // publishSampleMessage();
                }
            },
            message: function (message) {
                console.log("New Message!!", message.message);
            },
            presence: function (presenceEvent) {
                // handle presence
            }
        })
        console.log("Subscribing..");
        pubnub.subscribe({
            channels: [channel]
        });
        cb(null, true);
    }

    Notification.remoteMethod(
        'sub',
        {
            http: { path: '/sub', verb: 'get' },
            accepts:
            { arg: 'channel', type: 'string', http: { source: 'query' } },
            returns: { type: 'boolean', root: true },
        }
    );
};
