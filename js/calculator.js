var _ = require("underscore"),
    a = require("./restrictedserver.js").auths,
    async = require("async"),
    moment = require("moment"),
    jade = require("jade"),
    fs = require("fs");

exports.on = function (db, providers) {
    var userProvider = providers.userProvider,
        vehicleProvider = providers.vehicleProvider,
        tiresize = function(req, res){
            db.vehicle.find({}, function(err, vehicles){
                res.render('calculator/tiresize.jade', {vehicles: vehicles});
            });
        },
        angles = function(req, res){
            db.vehicle.find({}, function(err, vehicles){
                res.render('calculator/angles.jade', {vehicles: vehicles});
            });
        };
    return function (router) {
        router.get("/", function(req, res){res.render('home.jade', {});});

        router.get("/tiresize",  tiresize);
        router.get("/angles", angles);

    };
};
