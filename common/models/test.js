var accessToken  = "";
module.exports.getAccessToken = function (){
    console.log("get " + accessToken);
    return accessToken;
}

module.exports.setAccessToken = function(access){
    console.log("set " + access);
    accessToken = access;
}