'use strict';
var Particle = require('particle-api-js');
var particle = new Particle();

var tm = require("./tm");
var http = require('http');
var request = require('request');

var app = require('../../server/server');

module.exports = function (Device) {
    //add device
    Device.addDevice = function (data, cb) {
        if (Object.keys(data).length && !data.id) {// check object null
            particle.claimDevice({ deviceId: data.deviceId, auth: tm.getAccessToken() }).then(function (dataParticle) {
                //create thingspeak
                var Thingspeak = {};
                Thingspeak.api_key = tm.getApiThingspeak();
                Thingspeak.name = data.nameDevice;
                Thingspeak.description = "";
                Thingspeak.latitude = data.latitude + "";
                Thingspeak.longitude = data.longitude + "";
                Thingspeak.public_flag = true;
                Thingspeak.field1 = "tempC";
                Thingspeak.field2 = "dewPoint";
                Thingspeak.field3 = "heatIndex";
                Thingspeak.field4 = "humidity";
                Thingspeak.field5 = "pressure";
                Thingspeak.field6 = "lightLevel";

                request.post({
                    headers: { 'content-type': 'application/json' },
                    url: "https://api.thingspeak.com/channels.json",
                    json: Thingspeak
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        data.KeyThingspeak = body.api_keys[1].api_key;
                        data.channelID = body.id;
                        // them duoi database
                        Device.findOrCreate({ where: { deviceId: { like: dataParticle.deviceID } } }, data, function (err, instance, created) {
                            if (created && !err) {
                                //create chart thingspeak
                                var ChartThingspeak = app.models.ChartThingspeak;
                                var listName = ['tempC', 'dewPoint', 'heatIndex', 'humidity', 'pressure', 'lightLevel'];
                                var charts = [];
                                for (var i = 0; i < listName.length; i++) {
                                    charts.push({
                                        'name': listName[i],
                                        'content': '<iframe width="450" height="260" style="border: 1px solid #cccccc;" src="https://thingspeak.com/channels/' + data.channelID + '/charts/' + (i + 1) + '?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15"></iframe>',
                                        'description': '',
                                        'active': true,
                                        'deviceId': instance.id
                                    });
                                }
                                ChartThingspeak.create(charts, function (err, obj) {
                                    if (!err) {
                                        cb(null, true);
                                    } else {
                                        cb(null, false);
                                    }
                                });
                            } else {
                                // da ton tai hoac co loi 
                                console.log('addDevice database error!');
                                cb(null, false);
                            }
                        });
                    } else {
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
    Device.removeDevice = function (deviceId, channelID, cb) {
        if (deviceId) {
            particle.removeDevice({ deviceId: deviceId, auth: tm.getAccessToken() }).then(function (data) {
                // xoa duoi database
                Device.destroyAll({ deviceId: { like: deviceId } }, function (err, data) {
                    if (!err) {
                        // delete thingspeak
                        request.delete({
                            headers: { 'content-type': 'application/json' },
                            url: "https://api.thingspeak.com/channels/" + channelID,
                            json: {
                                'api_key': tm.getApiThingspeak
                            }
                        }, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                cb(null, true);
                            } else {
                                cb(null, false);
                            }
                        });
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
            accepts: [
                { arg: 'deviceId', type: 'string', required: true, http: { source: 'query' } },
                { arg: 'channelID', type: 'number', http: { source: 'query' } }
            ],
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

    //set time delay
    Device.setTimeDelay = function (deviceId, timeDelay, cb) {
        var fnPr = particle.callFunction({ deviceId: deviceId, name: 'setTimeDelay', argument: '' + timeDelay, auth: tm.getAccessToken() });
        fnPr.then(
            function (data) {
                console.log(timeDelay);
                console.log("set time delay success");
                cb(null, true);
            }, function (err) {
                console.log('getInfoEnv error!');
                cb(null, false);
            });
    }

    Device.remoteMethod(
        'setTimeDelay',
        {
            http: { path: '/setTimeDelay', verb: 'get' },
            accepts: [
                { arg: 'deviceId', type: 'string', http: { source: 'query' } },
                { arg: 'timeDelay', type: 'number', http: { source: 'query' } }
            ],
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    //tat mo den
    Device.controllerLed = function (deviceId, command, cb) {
        var fnPr = particle.callFunction({ deviceId: deviceId, name: 'controllLed', argument: command, auth: tm.getAccessToken() });
        fnPr.then(
            function (data) {
                console.log(command);
                console.log("controller led success");
                cb(null, true);
            }, function (err) {
                console.log('getInfoEnv error!');
                cb(null, false);
            });
    }

    Device.remoteMethod(
        'controllerLed',
        {
            http: { path: '/controllerLed', verb: 'get' },
            accepts: [
                { arg: 'deviceId', type: 'string', http: { source: 'query' } },
                { arg: 'command', type: 'string', http: { source: 'query' } }
            ],
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    // tinh trang den led
    Device.isLed = function (deviceId, cb) {
        particle.getVariable({ deviceId: deviceId, name: 'isLed', auth: tm.getAccessToken() }).then(function (data) {
            cb(null, data.body.result);
        }, function (err) {
            console.log('isLed error!');
            cb(null, null);
        });
    }

    Device.remoteMethod(
        'isLed',
        {
            http: { path: '/isLed', verb: 'get' },
            accepts: { arg: 'deviceId', type: 'string', http: { source: 'query' } },
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    // get time delay
    Device.getTimeDelay = function (deviceId, cb) {
        particle.getVariable({ deviceId: deviceId, name: 'timeDelay', auth: tm.getAccessToken() }).then(function (data) {
            cb(null, data.body.result);
        }, function (err) {
            console.log('timeDelay error!');
            cb(null, -1);
        });
    }

    Device.remoteMethod(
        'getTimeDelay',
        {
            http: { path: '/getTimeDelay', verb: 'get' },
            accepts: { arg: 'deviceId', type: 'string', http: { source: 'query' } },
            returns: { arg: 'result', type: 'number' },
        }
    );



    //set low  tempC
    Device.setLowTemp = function (deviceId, lowTemp, cb) {
        var fnPr = particle.callFunction({ deviceId: deviceId, name: 'setlTemp', argument: '' + lowTemp, auth: tm.getAccessToken() });
        fnPr.then(
            function (data) {
                console.log(lowTemp);
                console.log("set time delay success");
                cb(null, true);
            }, function (err) {
                console.log('getInfoEnv error!');
                cb(null, false);
            });
    }

    Device.remoteMethod(
        'setLowTemp',
        {
            http: { path: '/setLowTemp', verb: 'get' },
            accepts: [
                { arg: 'deviceId', type: 'string', http: { source: 'query' } },
                { arg: 'lowTemp', type: 'number', http: { source: 'query' } }
            ],
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    // get low temp
    Device.getLowTemp = function (deviceId, cb) {
        particle.getVariable({ deviceId: deviceId, name: 'lowTemp', auth: tm.getAccessToken() }).then(function (data) {
            cb(null, data.body.result);
        }, function (err) {
            console.log('getLowTemp error!');
            cb(null, null);
        });
    }

    Device.remoteMethod(
        'getLowTemp',
        {
            http: { path: '/getLowTemp', verb: 'get' },
            accepts: { arg: 'deviceId', type: 'string', http: { source: 'query' } },
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    //set low  tempC
    Device.setHeightTemp = function (deviceId, heightTemp, cb) {
        var fnPr = particle.callFunction({ deviceId: deviceId, name: 'sethTemp', argument: '' + heightTemp, auth: tm.getAccessToken() });
        fnPr.then(
            function (data) {
                console.log(heightTemp);
                console.log("set time delay success");
                cb(null, true);
            }, function (err) {
                console.log('getInfoEnv error!');
                cb(null, false);
            });
    }

    Device.remoteMethod(
        'setHeightTemp',
        {
            http: { path: '/setHeightTemp', verb: 'get' },
            accepts: [
                { arg: 'deviceId', type: 'string', http: { source: 'query' } },
                { arg: 'heightTemp', type: 'number', http: { source: 'query' } }
            ],
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    // get low temp
    Device.getHeightTemp = function (deviceId, cb) {
        particle.getVariable({ deviceId: deviceId, name: 'heightTemp', auth: tm.getAccessToken() }).then(function (data) {
            cb(null, data.body.result);
        }, function (err) {
            console.log('getHeightTemp error!');
            cb(null, null);
        });
    }

    Device.remoteMethod(
        'getHeightTemp',
        {
            http: { path: '/getHeightTemp', verb: 'get' },
            accepts: { arg: 'deviceId', type: 'string', http: { source: 'query' } },
            returns: { arg: 'result', type: 'boolean' },
        }
    );
};
