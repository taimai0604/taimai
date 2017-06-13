'use strict';

module.exports = function (Account) {

    //create account
    //add device
    Account.createAccount = function (data, cb) {
        if (Object.keys(data).length && !data.id) {// check object null
            // them duoi database
            Account.findOrCreate({where:{ username: data.username }}, data, function (err, instance, created) {
                if (created && !err) {
                    cb(null, true);
                } else {
                    // da ton tai hoac co loi 
                    cb(null, false);
                }
            });
        }else{
            cb(null, false);
        }
    }

    Account.remoteMethod(
        'createAccount',
        {
            http: { path: '/createAccount', verb: 'post' },
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'result', type: 'boolean' },
        }
    );

    //get account
    Account.getAccount = function (id, cb) {
        Account.findOne({ where: { id: id } }, function (err, data) {
            if (!err) {
                cb(null, data);
            }
        });
    }

    Account.remoteMethod(
        'getAccount',
        {
            http: { path: '/getAccount/:id', verb: 'get' },
            accepts: { arg: 'id', type: 'string', required: true },
            returns: { type: 'object', root: true },
        }
    );
    //check login
    Account.checkLogin = function (username, password, cb) {
        console.log(username);
        console.log(password);
        Account.findOne({
            where:
            {
                and: [
                    { username: username },
                    { password: password }]
            }
        }, function (err, data) {
            cb(null, data);
        });
    }

    Account.remoteMethod(
        'checkLogin',
        {
            http: { path: '/checkLogin', verb: 'get' },
            accepts: [{ arg: 'username', type: 'string', http: { source: 'query' }, required: true }, { arg: 'password', type: 'string', http: { source: 'query' }, required: true }],
            returns: { type: 'object', root: true },
        }
    );
};
