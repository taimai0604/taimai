'use strict';
var PubNub = require('pubnub')
module.exports = function (Test) {
    var pubnub = new PubNub({
        subscribeKey: "sub-c-c8dbb904-57bc-11e7-af75-02ee2ddab7fe",
        publishKey: "pub-c-cd864c3f-3537-4adb-95d0-40c3fb8116bb"
    })

    function publishSampleMessage() {
        console.log("Since we're publishing on subscribe connectEvent, we're sure we'll receive the following publish.");
        var publishConfig = {
            channel: "hello",
            message: "Hello from PubNub Docs!"
        }
        pubnub.publish(publishConfig, function (status, response) {
            console.log(status, response);
        })
    }



    //get data
    Test.test = function (cb) {
        pubnub.addListener({
            status: function (statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    publishSampleMessage();
                }
            },
            message: function (message) {
                console.log("New Message!!", message.message);
            },
            presence: function (presenceEvent) {
                // handle presence
            }
        })
        // console.log("Subscribing..");
        pubnub.subscribe({
            channels: ['hello']
        });
        cb(null, true);
    }

    Test.remoteMethod(
        'test',
        {
            http: { path: '/test', verb: 'get' },
            // accepts: { arg: 'filter', type: 'object', http: { source: 'query' } },
            returns: { type: 'boolean', root: true },
        }
    );

      Test.pub = function (content, cb) {

        var publishConfig = {
            channel: "hello",
            message: content
        }
        pubnub.publish(publishConfig, function (status, response) {
            console.log("pub");
            // console.log(status, response);
        })
        cb(null,true);
    }

    Test.remoteMethod(
        'pub',
        {
            http: { path: '/pub', verb: 'get' },
            accepts: { arg: 'content', type: 'string', http: { source: 'query' } },
            returns: { type: 'boolean', root: true },
        }
    );
};
