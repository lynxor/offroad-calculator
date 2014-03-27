var mongojs = require('mongojs'),
    UserProvider = require("./db/user_provider.js").UserProvider,
    VehicleProvider = require("./db/vehicle_provider.js").VehicleProvider;




module.exports = function (options, callback) {

    var database = mongojs.connect(require("./cloudfoundry-mongo.js").mongourl, ["user", "vehicle", "fuel"]);

    if (database) {
        var providers = {

            userProvider:new UserProvider(database),
            vehicleProvider: new VehicleProvider(database)

        };
        callback(null, database, providers);
    } else {
        callback(new Error("Cannot connect to database"));
    }
};
