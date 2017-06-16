'use strict';
var Particle = require('particle-api-js');
var particle = new Particle();

var tm = require("./tm");
var http = require('http');
var request = require('request');

module.exports = function (Device) {
    //add device
    Device.addDevice = function (data, cb) {
        if (Object.keys(data).length && !data.id) {// check object null
            particle.claimDevice({ deviceId: data.deviceId, auth: tm.getAccessToken() }).then(function (dataParticle) {
                // them duoi database
                Device.findOrCreate({ deviceId: data.deviceId }, data, function (err, instance, created) {
                    if (created && !err) {
                        cb(null, true);
                    } else {
                        // da ton tai hoac co loi 
                        cb(null, false);
                    }
                });
            }, function (err) {
                console.log('addDevice error!');
                cb(null, false);
            });
        } else {
            cb(null, false);
        }
    }

    Device.remoteMethod(
        'addDevice',
        {
            http: { path: '/addDevice', verb: 'post' },
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'result', type: 'boolean' },
        }
    );


    //edit device
    Device.editDevice = function (id, data, cb) {
        particle.renameDevice({ deviceId: data.deviceId, name: data.nameDevice, auth: tm.getAccessToken() }).then(function (data1) {
            Device.replaceById(id, data, function (err, instance) {
                console.log(!err);
                if (!err) {
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            });
        }, function (err) {
            console.log('edit error!');
            cb(null, false);
        });

    }

    Device.remoteMethod(
        'editDevice',
        {
            http: { path: '/:id/editDevice', verb: 'post' },
            accepts: [{ arg: 'id', type: 'string', required: true }, { arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    //remove device
    Device.removeDevice = function (deviceId, cb) {
        if (deviceId) {
            particle.removeDevice({ deviceId: deviceId, auth: tm.getAccessToken() }).then(function (data) {
                // xoa duoi database
                Device.destroyAll({ deviceId: { like: deviceId } }, function (err, data) {
                    if (!err) {
                        cb(null, true);
                    } else {
                        cb(null, false);
                    }
                });
            }, function (err) {
                console.log('removeDevice error!');
                cb(null, false);
            });
        } else {
            cb(null, false);
        }
    }
    Device.remoteMethod(
        'removeDevice',
        {
            http: { path: '/removeDevice', verb: 'post' },
            accepts: { arg: 'deviceId', type: 'string', required: true, http: { source: 'query' } },
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
            returns: { type: 'array', root: true },
        }
    );

    //xem cac thong so o thoi gian hien tai
    Device.getInfoEnv = function (deviceId, cb) {
        var fnPr = particle.callFunction({ deviceId: deviceId, name: 'setCurrent', argument: '', auth: tm.getAccessToken() });
        fnPr.then(
            function (data) {
                if (data.body.return_value == 1) {
                    particle.getVariable({ deviceId: deviceId, name: 'enviCurrent', auth: tm.getAccessToken() }).then(function (data) {
                        cb(null, data.body.result);
                    }, function (err) {
                        console.log('getInfoEnv error!');
                        cb(null, null);
                    });
                }
            }, function (err) {
                console.log('getInfoEnv error!');
                cb(null, null);
            });
    }

    Device.remoteMethod(
        'getInfoEnv',
        {
            http: { path: '/getInfoEnv', verb: 'get' },
            accepts: { arg: 'deviceId', type: 'string', http: { source: 'query' } },
            returns: { type: 'object', root: true },
        }
    );
};
