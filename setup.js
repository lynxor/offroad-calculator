var _ = require("underscore"),
    mongojs = require("mongojs"),
    UserProvider = require("./js/db/user_provider.js").UserProvider,
    moment = require("moment"),
    async = require("async"),
    db = mongojs.connect( require("./js/cloudfoundry-mongo.js").mongourl, ["user", "post"]),
    userProvider = new UserProvider(db),
    synchelper = require("./js/synchelper.js");


synchelper.waitForAll(
    function (callback) {
        //console.log("dropping db..");
       // db.dropDatabase(callback);
        callback();
    },
    function (callback) {
        console.log("starting with users ... ");
        userProvider.insertBulk([
            {email:"admin", role:{name:"admin"}, password:"password"}
        ], callback);
    }

)(function () {
    console.log("Done");
    //process.exit(0);
});

