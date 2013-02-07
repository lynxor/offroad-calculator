var _ = require("underscore"),
    a = require("./restrictedserver.js").auths,
    async = require("async"),
    moment = require("moment"),
    jade = require("jade"),
    fs = require("fs");

exports.on = function (db, providers) {
    var userProvider = providers.userProvider,
        vehicleProvider = providers.vehicleProvider;
    return function (router) {
        router.get("/", function(req, res){res.render('home.jade', {});});

        router.get("/tiresize",  function(req, res){res.render('calculator/tiresize.jade', {})});
        router.get("/angles", function(req, res){res.render('calculator/angles.jade', {})});

    };
};
