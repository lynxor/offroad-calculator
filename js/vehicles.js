var _ = require("underscore"),
    a = require("./restrictedserver.js").auths,
    async = require("async"),
    moment = require("moment"),
    jade = require("jade"),
    fs = require("fs"),
     ObjectID = require('mongodb').ObjectID;

exports.on = function (db, providers) {
    var userProvider = providers.userProvider,
        vehicleProvider = providers.vehicleProvider,
        allVehicles = function(req, res){
            db.vehicle.find({}, function(err, docs){
                res.render("vehicles/vehicles.jade", {vehicles: docs});
            });
        },
        addVehicle = function(req, res){
          db.vehicle.insert(vehicleProvider.fill(req.body.vehicle), function(){
              res.redirect("/vehicles");
          });
        },
        saveVehicle = function(req, res){
            db.vehicle.update({_id: new ObjectID(req.params.vehicleId)},req.body.vehicle, function(){
                res.redirect('/vehicles');
            });
        },
        viewEditVehicle = function(req, res){
            db.vehicle.findOne({_id: new ObjectID(req.params.vehicleId)}, function(err, v){
                res.render("vehicles/vehicle_edit.jade", {vehicle: v});
            });

        },
        viewNewVehicle = function(req, res){
            res.render("vehicles/vehicle_new.jade", {vehicle: vehicleProvider.emptyVehicle()});
        };

    return function (router) {
        router.get("/vehicles/edit/:vehicleId", a.hasRole("admin"), viewEditVehicle);
        router.get("/vehicles", allVehicles);
        router.get("/vehicles/new", a.hasRole("admin"), viewNewVehicle);
        router.post("/vehicles/new", a.hasRole("admin"), addVehicle);
        router.post("/vehicles/save/:vehicleId", a.hasRole("admin"), saveVehicle);

    };
};
