'use strict';

var request = require('request');
var app = require('../../server/server');

module.exports = function (Environment) {

    //handle create Environment
    Environment.beforeRemote('create', function (context, user, next) {
        var Device = app.models.Device;
        Device.findOne({ where: { deviceId: { like: context.args.data.deviceIdParticle } } }, function (err, device) {
            if (!err && device != null) {
                context.args.data.deviceId = '' + device.id;
                next();
            }
        });
    });

    //truyen du lieu len thingspeak
    Environment.transferToThingSpeak = function (data, cb) {
        if (Object.keys(data).length && !data.id) {// check object null
            var Device = app.models.Device;
            Device.findOne({ where: { deviceId: { like: data.deviceIdParticle } } }, function (err, device) {
                if (!err) {
                    console.log("key thing speak "+ device);
                    // if (device.KeyThingspeak) {
                        // var api_key = device.KeyThingspeak;
                        // request.get({
                        //     url: "https://api.thingspeak.com/update?api_key=" + api_key
                        //     + "&field1=" + data.tempC
                        //     + "&field2=" + data.dewPoint
                        //     + "&field3=" + data.heatIndex
                        //     + "&field4=" + data.humidity
                        //     + "&field5=" + data.pressure
                        //     + "&field6=" + data.lightLevel
                        // }, function (error, response, body) {
                        //     if (!error && response.statusCode == 200) {
                        //         cb(null, true);
                        //     }
                        // });
                    // }
                } else {
                    cb(null, false);
                }
            });
        } else {
            cb(null, false);
        }
    }

    Environment.remoteMethod(
        'transferToThingSpeak',
        {
            http: { path: '/transferToThingSpeak', verb: 'post' },
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    //get data
    Environment.getDataAll = function (filter, cb) {
        console.log(filter);
        Environment.find({ where: filter }, function (err, data) {
            cb(null, data);
        });
    }

    Environment.remoteMethod(
        'getDataAll',
        {
            http: { path: '/getDataAll', verb: 'get' },
            accepts: { arg: 'filter', type: 'object', http: { source: 'query' } },
            returns: { type: 'array', root: true },
        }
    );
};
