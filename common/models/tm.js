var accessToken = "";
var apiThingspeak = "";
var time_delay;

module.exports.getAccessToken = function (){
    return this.accessToken;
}

module.exports.setAccessToken = function(access){
    this.accessToken = access;
}

module.exports.getApiThingspeak = function (){
    return this.apiThingspeak;
}

module.exports.setApiThingspeak = function(apiKey){
    this.apiThingspeak = apiKey;
}