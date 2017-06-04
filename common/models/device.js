'use strict';
var Particle = require('particle-api-js');
var particle = new Particle();
var token = "3e17a2f5f6c1cd55310c83e62d1546d91d32dac1";
// var deviceId = "2e0027001247343339383037";

var test = require("./test");
var http = require('http');
var request = require('request');

module.exports = function (Device) {
    //add device
    Device.addDevice = function (data, cb) {
        if(Object.keys(data).length && !data.id){// check object null
            Device.create([data]);
            cb(null,true);
        }else{
            cb(null,false);
        }
    }

     Device.remoteMethod(
        'addDevice',
        {
            http: { path: '/addDevice', verb: 'post' },
            accepts: {arg: 'data', type: 'object', http: { source: 'body' }},
            returns: { arg: 'result', type: 'boolean' },
        }
    );


    //edit name device
    Device.nameDevice = function (cb) {
        console.log("edit name device");
    }

    //remove device
    Device.removeDevice = function (deviceId, cb) {
        // particle.removeDevice({ deviceId: deviceId, auth: token }).then(function(data) {
        // console.log('remove call response:', data);
        // }, function(err) {
        // console.log('An error occurred while removing:', err);
        // });
        if (deviceId) {
            console.log(deviceId);
        }
        cb(null, true);
    }
    Device.remoteMethod(
        'removeDevice',
        {
            http: { path: '/removeDevice', verb: 'post' },
            accepts: { arg: 'deviceId', type: 'string', http: { source: 'query' } },
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    //get list device
    Device.getListDevice = function (cb) {
        Device.find({}, function (err, devices) {
            cb(null, devices);
        });

        // var devicesPr = particle.listDevices({ auth: token });
        // devicesPr.then(
        //     function (devices) {
        //         var result = [];
        //         devices.body.forEach(function (element) {
        //             var device = new Device();
        //             device.deviceId = element.id;
        //             device.nameDevice = element.name;
        //             result.push(device);
        //         }, this);
        //         console.log(devices);
        //         cb(null, result);
        //     },
        //     function (err) {
        //         console.log('List devices call failed: ', err);
        //     }
        // );

        // var options = {
        //     host: 'localhost',
        //     port: 3000,
        //     path: '/api/Configs',
        //     headers: { 'Content-Type': 'application/json' },
        // };

        // var req = http.request(options, function (response) {
        //     var str = '';
        //     response.on('data', function (chunk) {
        //         str += chunk;
        //     });

        //     response.on('end', function () {
        //         var obj = str[0];
        //         console.log(obj);
        //         cb(null, obj.accessToken);
        //     });
        // }).end();


        // // request server 
        // request.get({ url: "http://localhost:3000/api/Configs" }, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         // console.log(body);
        //         var obj = JSON.parse(body);
        //         console.log(obj[0].accessToken);
        //         cb(null, obj[0].accessToken);
        //     }
        // });
        // // -------------------

        // call function local:
        // console.log("accessToken : " + test.getAccessToken());
        //  cb(null, test.getAccessToken());
    };

    Device.remoteMethod(
        'getListDevice',
        {
            http: { path: '/getListDevice', verb: 'get' },
            returns: {type: 'array', root: true},
        }
    );

    // Device.beforeRemote('getListDevice', function () {
    //     console.log("before remote get list device " + Date.now());
    // });
};
