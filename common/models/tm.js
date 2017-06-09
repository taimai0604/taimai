var accessToken = "";
var time_delay;

module.exports.getAccessToken = function (){
    return this.accessToken;
}

module.exports.setAccessToken = function(access){
    this.accessToken = access;
}

module.exports.setTimeDelay = function(time){
    this.time_delay = time;
}

module.exports.getTimeDelay = function(){
    return this.time_delay;
}