var restrictedServer = require("./restrictedserver.js"),
    _ = require("underscore"),
    mongojs = require('mongojs'),
    UserProvider = require("./db/user_provider.js").UserProvider,
    admin = require("./admin.js"),
    path = require("path"),
    users = require("./users.js"),
    vehicles = require("./vehicles.js"),
    calculators = require("./calculator.js"),
    fs = require("fs"),
    providers = require("./providers.js"),
    jade = require("jade"),
    winston = require("winston"),
    async = require("async"),
    mail_config = JSON.parse(fs.readFileSync("./conf/mailer.json")),
    Mailer = require("./mailer.js").Mailer;


var defaultOptions = {
    dbUrl:"localhost:27017/template",
    roles:["admin", "client"]
};

module.exports = function (o, done) {


    var logger = winston.loggers.get("server"),
        mailerConfig = _.extend({}, mail_config, o.hasOwnProperty("mailer") ? o.mailer : {}),
        mailer = new Mailer(mailerConfig),
        options = _.extend({}, {mailer:mailer}, defaultOptions, o),
        assetToken = (new Date()).getTime(),
        staticRoot = path.join(path.join(__dirname, ".."), "public");

    winston.loggers.add("server", {console:{colorize:true}, file:{filename:"server.log", timestamp:true}});

    providers(o, function (err, database, providers) {
        var userchecker = function (email, password, done) {
                return providers.userProvider.retrieve(email, password, function (err, user) {
                    if (user && !err && user.failedLogins < 5) {
                        providers.userProvider.resetFailedLogins(user.email, function () {
                            done(null, user);
                        });
                    }
                    //so we do not reset if locked. bit of a workaround
                    else if (user) {
                        done(null, user);
                    }
                    else {
                        providers.userProvider.incFailedLogins(email, function (err, user) {
                            done(null, false);
                        });
                    }
                });
            },
            router = restrictedServer.server(_.extend({}, {userchecker:userchecker}, options));

        if (err) {
            console.log("Error creating database: " + err);
            process.exit(1);
            return;
        }


        // add the admin routes
        admin.on(providers, options.roles, assetToken)(router);

        //user routes
        users.on(providers, options.mailer)(router);

        vehicles.on(database, providers)(router);
        calculators.on(database, providers)(router);

        done(router, database, providers, {
            mailer:options.mailer,
            options:o
        });
    });

}
