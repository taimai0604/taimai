var accessToken = "";
var time_delay;

module.exports.getAccessToken = function (){
    return this.accessToken;
}

module.exports.setAccessToken = function(access){
    this.accessToken = access;
}