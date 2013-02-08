var ObjectID = require('mongodb').ObjectID,
    _ = require("underscore"),
    async = require("async");


exports.VehicleProvider = function (db) {

    return {
        like: function(vehicleId, user, callback){
            db.vehicle.update({_id: new ObjectID(vehicleId)}, {$addToSet: {likes: user.firstname + user.lastname} }, callback);
        },
        fill: function(vehicle){
            return _.defaults(vehicle, this.emptyVehicle());
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

