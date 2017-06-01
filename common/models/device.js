'use strict';
var Particle = require('particle-api-js');
var particle = new Particle();
var token = "3e17a2f5f6c1cd55310c83e62d1546d91d32dac1";
var deviceId = "2e0027001247343339383037";

module.exports = function (Device) {
    //add device
    Device.addDevice = function (cb) {
        console.log("add device");
    }


    //edit name device
    Device.nameDevice = function (cb) {
        console.log("edit name device");
    }

    //remove device
    Device.removeDevice = function (cb) {
        console.log("remove device");

    }

    //get list device
    Device.getListDevice = function (cb) {
        console.log("get list device");
        var devicesPr = particle.listDevices({ auth: token });
        devicesPr.then(
            function (devices) {
                cb(null, devices);
            },
            function (err) {
                console.log('List devices call failed: ', err);
            }
        );
    };

    Device.remoteMethod(
        'getListDevice',
        {
            http: { path: '/getListDevice', verb: 'get' },
            returns: { arg: 'devices', type: 'string' },
        }
    );

    Device.beforeRemote('getListDevice', function () {
        console.log("before remote get list device " + Date.now());
    });
};
