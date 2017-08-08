'use strict';
var PubNub = require('pubnub');
var request = require('request');
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
        cb(null, true);
    }

    Test.remoteMethod(
        'pub',
        {
            http: { path: '/pub', verb: 'get' },
            accepts: { arg: 'content', type: 'string', http: { source: 'query' } },
            returns: { type: 'boolean', root: true },
        }
    );
    //
    // get list channel thingspeak
    Test.getListChannelThingspeak = function (cb) {
        request.get({
            url: "https://api.thingspeak.com/channels.json?api_key=SJ4PGADN6D128M13"
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, body);
            }
        });
    }

    Test.remoteMethod(
        'getListChannelThingspeak',
        {
            http: { path: '/getListChannelThingspeak', verb: 'get' },
            returns: { type: 'array', root: true },
        }
    );

    //create channel thingspeak
    Test.createChannelThingspeak = function (apiThingspeak, data, cb) {
        var o = JSON.parse(data);
        console.log(o.api_key);
        request.post({
            headers: { 'content-type': 'application/json' },
            url: "https://api.thingspeak.com/channels.json?api_key=" + apiThingspeak,
            body: o
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, body);
            }
        });
    }

    Test.remoteMethod(
        'createChannelThingspeak',
        {
            http: { path: '/createChannelThingspeak', verb: 'post' },
            accepts: [
                { arg: 'apiThingspeak', type: 'string', http: { source: 'query' } },
                { arg: 'data', type: 'string', http: { source: 'body' } }
            ],
            returns: { type: 'object', root: true },
        }
    );

    //delete channel thingspeak
    Test.deleteChannelThingspeak = function (channelID, data, cb) {
        // var o = {};
        // o.api_key = data
        var data1 = {};
        console.log(data1.api_key);
        data1.name = "taimai";

        console.log(data1);
        // request.delete({
        //     headers: { 'content-type': 'application/json' },
        //     url: "https://api.thingspeak.com/channels/" + channelID,
        //     body: data
        // }, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         cb(null, body);
        //     }
        // });
    }

    Test.remoteMethod(
        'deleteChannelThingspeak',
        {
            http: { path: '/deleteChannelThingspeak', verb: 'delete' },
            accepts: [
                { arg: 'channelID', type: 'number', http: { source: 'query' } },
                { arg: 'data', type: 'object', http: { source: 'body' } }
            ],
            returns: { type: 'object', root: true },
        }
    );
};
