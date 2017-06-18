'use strict';

var request = require('request');
var app = require('../../server/server');

module.exports = function (Environment) {
    // Environment.addEnviroment = function (data, cb) {
    //     var Device = app.models.Device;
    //     Device.findOne({ where: { deviceId: { like: data.deviceIdParticle } } }, function (err, device) {
    //         data.deviceId = device.id + "";
    //         // them duoi database
    //         Device.create(data, function (err, device) {
    //             console.log(err);
    //             console.log(device);
    //             if (!err) {
    //                 cb(null, true);
    //             } else {
    //                 // da ton tai hoac co loi 
    //                 cb(null, false);
    //             }
    //         });
    //     });
    // }

    // Environment.remoteMethod(
    //     'addEnviroment',
    //     {
    //         http: { path: '/addEnviroment', verb: 'post' },
    //         accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    //         returns: { type: 'object', root: true },
    //     }
    // );

    //truyen du lieu len thingspeak
    Environment.transferToThingSpeak = function (data, cb) {
        if (Object.keys(data).length && !data.id) {// check object null
            var Device = app.models.Device;
            Device.findOne({ where: { deviceId: { like: data.deviceIdParticle } } }, function (err, device) {
                if (!err) {
                    console.log(data.deviceIdParticle);
                    var api_key = device.keyThingspeak;
                    console.log(api_key);
                    request.get({
                        url: "https://api.thingspeak.com/update?api_key=" + api_key
                        + "&field1=" + data.tempC
                        + "&field2=" + data.dewPoint
                        + "&field3=" + data.heatIndex
                        + "&field4=" + data.humidity
                        + "&field5=" + data.pressure
                        + "&field6=" + data.lightLevel
                    }, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            cb(null, true);
                        }
                    });
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
