var _ = require("underscore"),
    mongojs = require("mongojs"),
    UserProvider = require("./js/db/user_provider.js").UserProvider,
    moment = require("moment"),
    async = require("async"),
    db = mongojs.connect( require("./js/cloudfoundry-mongo.js").mongourl, ["user", "vehicle"]),
    userProvider = new UserProvider(db),
    synchelper = require("./js/synchelper.js"),
    fs = require("fs"),
    vehicles = JSON.parse( fs.readFileSync(__dirname + "/data/vehicles.json") );


synchelper.waitForAll(
    function (callback) {
        console.log("dropping db..");
        db.dropDatabase(callback);
    },
    function(callback){
        db.vehicle.insert(vehicles, callback);
    },
    function (callback, err, docs) {
        console.log("starting with users ... ");
        userProvider.insertBulk([
            {email:"admin", role:{name:"admin"}, password:"password"}
        ], callback);
    }

)(function () {
    console.log("Done");
    process.exit(0);
});

