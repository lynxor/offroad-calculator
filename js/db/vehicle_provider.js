var ObjectID = require('mongodb').ObjectID,
    _ = require("underscore"),
    async = require("async"),
    moment = require("moment"),
    scraper = require("./../fuel-scraper.js");


exports.VehicleProvider = function (db) {

    return {
        like: function(vehicleId, user, callback){
            db.vehicle.update({_id: new ObjectID(vehicleId)}, {$addToSet: {likes: user.firstname + user.lastname} }, callback);
        },
        fill: function(vehicle){
            return _.defaults(vehicle, this.emptyVehicle());
        },
        retrieveFuel: function(callback){
          var min_date = moment().subtract('days', 14).toDate();
          db.fuel.find({date : {$gt : min_date}}).sort({date: 1}, function(err, docs){
             if(!docs.length){
                 scraper.scrape(function(err, petrol, diesel, date){
                     var fuel = {petrol: petrol, diesel: diesel, date: date};
                    db.fuel.insert(fuel, function(){});
                    callback(null,fuel);
                 });
             }
             else {
                 callback(null, docs[0]);
             }
          });
        },
        emptyVehicle: function(){
            return {
                brand: "",
                model: "",
                year: "2012",
                gears: "",
                diffs: "",
                suspension: "",
                service_interval: "",
                engine : {
                    description: "",
                    size: "",
                    compression_ratio: "",
                    max_power: "",
                    max_torque: "",
                    valves: "",
                    fuel_management: ""
                },
                dimensions: {
                    clearance: "",
                    approach: "",
                    departure: "",
                    breakover: "",
                    rollover: "",
                    wading: "",
                    turning_circle: "",
                    height: "",
                    length: "",
                    width: "",
                    wheelbase:""
                },
                mass:{
                    gvm: "",
                    curb: ""
                },
                fuel:{
                    type: "",
                    capacity: "",
                    economy: ""
                },
                wheels: {
                    rim: 16,
                    tread: 0,
                    profile: 0
                }
            }
        }
    };
};

