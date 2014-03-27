var ObjectID = require('mongodb').ObjectID,
    _ = require("underscore"),
    crypto = require('crypto'),
    async = require("async"),
    db_helper = require("./db_helper.js");


var UserProvider = function (db) {

    var that = this,
        salt = "7987sdf987fsd",
        encryptPassword = function (password) {
            return crypto.createHmac('sha1', salt).update(password).digest('hex');
        },
        newPassword = function(){
            return encryptPassword(new Date().getTime() * Math.random() + '');
        };

    return {
        retrieveAll: function (callback) {
            db.user.find(function (e,data) {
                if (!e) {
                    data.sort(function (a,b) { return a.email.localeCompare(b.email); });
                }
                callback(e, data);
            });
        },
        retrieve:function (email, password, callback) {
            var expected = encryptPassword(password);
            db.user.findOne({email: email, password: expected}, callback);
        },
        retrieveByEmail:function (email, callback) {
            db.user.findOne({email: email}, callback);
        },
        retrieveByRole : function(role, callback){
           db.user.find({"role.name": role}, callback);
        },
        //Also resets failed logins!!
        resetPassword:function (email, callback) {
            var npwd = newPassword();
            db.user.update({email : email}, {$set : {failedLogins : 0, password : encryptPassword(npwd)} }, function(err, result){
                callback(null, npwd);
            });
        },
        changePassword: function(email, newPwd, callback){
            db.user.update({email: email}, {$set : {failedLogins: 0, password : encryptPassword(newPwd)}}, callback);
        },
        //Always encrypts the password
        insert : function(user, callback){
            user.password = encryptPassword(user.password);
            db.user.insert(user, callback);
        },
        //NEVER encrypts the password
        update:function (user, callback) {
            db.user.update({email:user.email}, user, callback);
        },
        incFailedLogins:function (email, callback) {
            db.user.update({email : email}, {$inc : {failedLogins : 1}}, callback);
        },
        resetFailedLogins:function (email, callback) {
            db.user.update({email : email}, {$set : {failedLogins : 0}}, callback);
        },

        remove: function (query, callback) {
             db.user.remove(query, callback);
        },
        emptyUser: function(){
            return {email:"",firstname:"",lastname:"",role:{name:"norole"}};
        },
        //probably only for testing
        insertBulk: function(users, callback){
            db_helper.insertBulk(this.insert, users, callback);
        },
        db:db.user
    };
};

exports.UserProvider = UserProvider;