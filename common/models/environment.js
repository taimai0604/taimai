'use strict';

var Particle = require('particle-api-js');
var particle = new Particle();
var token = "3e17a2f5f6c1cd55310c83e62d1546d91d32dac1";

var request = require('request');
var api_key = "FYQOFWDRQ9JKGBFE";
module.exports = function (Environment) {
    //truyen du lieu len thingspeak
    Environment.transferToThingSpeak = function (data, cb) {
        if (Object.keys(data).length && !data.id) {// check object null
            // request server 
            request.get({ url: "https://api.thingspeak.com/update?api_key="+api_key
            +"&field1="+data.tempC
            +"&field2="+data.dewPoint
            +"&field3="+data.heatIndex
            +"&field4="+data.humidity
            +"&field5="+data.pressure
            +"&field6="+data.lightLevel
             }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    cb(null, true);
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
        Environment.find({where:filter},function(err,data){
            cb(null,data);
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
