var _ = require("underscore"),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    UserProvider = require("./db/user_provider.js").UserProvider,
    winston = require("winston");

var defaultOptions = {
    port:8080,
    dbHost:"localhost",
    dbName:"test",
    dbPort:27017,
    userchecker:function (username, password, done) {
        if (password === "password") {
            return done(null, {username:username, roles:[]});
        } else {
            return done(null, false);
        }
    },
    devMode:false
};

winston.loggers.add("errors", {console:{colorize:true}, file:{filename:"errors.log", timestamp:true}});
var logger = winston.loggers.get("errors");

var NotAuthenticated = function () {
    this.name = "Not authenticated";
    Error.call(this, "Not authenticated");
    Error.captureStackTrace(this, arguments.callee);
};
NotAuthenticated.prototype_ = new Error();
var NotAuthorized = function () {
    this.name = "Not authorized";
    Error.call(this, "Not authorized");
    Error.captureStackTrace(this, arguments.callee);
};
NotAuthorized.prototype = new Error();
var NotFound = function () {
    this.name = "Not found";
    Error.call(this, "Not found");
    Error.captureStackTrace(this, arguments.callee);
};
NotFound.prototype_ = new Error();

var userIs = function (user) {
    var roles = _(arguments).toArray().slice(1);

    return _(roles).any(function (x) {
        return (user && user.role && user.role.hasOwnProperty("name") && user.role.name === x);
    });

};


var auths = {
    isAuthenticated:function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            next(new NotAuthenticated());
        }
    },
    hasRole:function (role) {
        return function (req, res, next) {
            if (!req.isAuthenticated()) return next(new NotAuthenticated());
            if (userIs(req.user, role)) {
                return next();
            } else {
                return next(new NotAuthorized());
            }
        };
    },
    hasAnyRole:function (/*...*/) {
        var roles = arguments;
        return function (req, res, next) {
            if (!req.isAuthenticated()) return next(new NotAuthenticated());
            if ((roles.length === 0) || _(roles).any(function (x) {
                return userIs(req.user, x);
            })) {
                return next();
            } else {
                return next(new NotAuthorized());
            }
        };
    },

    hasAllRoles:function (/*...*/) {
        var roles = arguments;
        return function (req, res, next) {
            if (!req.isAuthenticated()) return next(new NotAuthenticated());
            if ((roles.length === 0) || _(roles).all(function (x) {
                return userIs(req.user, x);
            })) {
                return next();
            } else {
                return next(new NotAuthorized());
            }
        };
    },

    hasRoleProperty:function (prop) {
        return function (req, res, next) {
            if (req.user.role.hasOwnProperty(prop)) next();
            else next(new NotAuthorized());
        };
    },

    skipOnFail:function (req, res, e, next) {
        if (!_.isFunction(e)) return next("route");
        return e();
    },

    showAuthorizationError:function (req, res) {
        res.render('errors/auth.jade', function (err, template) {
            if (err) {
                console.log(err);
                res.writeHead(500, {"Content-type":"text/html"});
                res.end(err);
            }
            res.writeHead(403, {"Content-type":"text/html"});
            res.end(template);
        });
    },

    showLoginPage:function (req, res) {
        if (req.params.fail) {
            req.flash("error", "Authentication failed");
        }

        res.render('login.jade', function (err, template) {
            if (err) {
                console.log(err.stack);
                res.writeHead(500, {"Content-type":"text/html"});
                return res.end(err);
            }
            if (!req.isAuthenticated()) {
                res.writeHead(403, {"Content-type":"text/html"});
                return res.end(template);
            } else {
                res.writeHead(200, {"Content-type":"text/html"});
                return res.end(template);
            }
        });
    }
};
var server = function (options) {
    var o = _.extend(defaultOptions, options),
        express = require("express"),
        passport = require("passport"),
        LocalStrategy = require("passport-local").Strategy;

    passport.use(new LocalStrategy({ usernameField:'email', passwordField:'password'},
        function (username, password, done) {
            o.userchecker(username, password, done);
        }
    ));
    passport.serializeUser(function (user, done) {
        done(null, JSON.stringify(user));
    });
    passport.deserializeUser(function (id, done) {
        done(null, JSON.parse(id));
    });
    var router = express();
    router.use(express.cookieParser());
    router.use(express.bodyParser());
    router.use(express.session({secret:"deadbeefdeadfeebfeebdead"}));
    router.use(passport.initialize());
    router.use(passport.session());
    router.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    router.use(require('connect-flash')());
    router.use("/public", express.static(__dirname + '/../public'));
    router.set('view options', { layout:false, asset_token:new Date().getTime() });

    var AT = (new Date()).getTime();
    router.use(function (req, res, next) {
        res.locals = {
            user:req.user,
            admin:req.hasOwnProperty("user") && req.user && userIs(req.user, "admin"),
            dsclient:req.hasOwnProperty("user") && req.user && userIs(req.user, "client"),
            asset_token:AT,
            messages:require('express-messages')(req,res),
            flash : req.flash.bind(req)
        };
        next();
    });

    router.post("/login", passport.authenticate("local", {failureRedirect:'/login/fail'}), function (req, res) {

        if (req.user.failedLogins >= 5) {
            var user = req.user;
            req.logout();
            res.render("lockeduser.jade", {u:user});
        } else {
            if (req.session.hasOwnProperty("prevUrl")) {
                res.redirect(req.session.prevUrl);
            } else {
                res.redirect("/");
            }
        }
    });

    router.get("/login/:fail?", auths.showLoginPage);

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    var failure = function (req, res, error) {
        var msg = ((typeof(error) !== "undefined" && error !== null) ? error.toString() : "");
        //logger.error("When Is Failure", {req: req.url, error_s: msg, error: error});
        console.log("Failure: " + msg);
        res.writeHead(503, {"Content-type":"text/html"});
        res.end("<html>Failure: " + msg + "</html>");
    };

    router.use(function (error, req, res, next) {
        if (error instanceof NotAuthenticated) {
            req.session.prevUrl = req.url;
            res.redirect("/login");
        } else if (error instanceof NotAuthorized) {
            auths.showAuthorizationError(req, res);
        } else if (error instanceof NotFound) {
            res.render("errors/404.jade", {status:404});
        } else if (error instanceof Error) {
            logger.error("Error occured: " + Error.toString(), {stack:error.stack, o:JSON.stringify(error)});
            console.log(error.stack);
            res.render("errors/500.jade", {status:500, error:error.toString()});
            //process.exit(1);
            //return next(error);
        } else {
            logger.error("Error occured: " + Error.toString(), {stack:error.stack, o:JSON.stringify(error)});
            console.log("Non-error: " + error);
            res.render("errors/500.jade", {status:500, error:error.toString()});
        }
        //failure(req, res, error);
    });

    return {
        listen:function () {
            router.get("*", function (req, res) {
                res.render("errors/404.jade", {status:404});
            });
            //failure(req, res, error);
            router.listen(o.port, o.host);
        }, //_.bind(router.listen, null, o.port),
        close:function () {
            router.close();
        },
        param:_.bind(router.param, router),
        get:o.devMode === false ? _.bind(router.get, router) : function () {
            _.bind(router.get, router)(arguments[0], _.last(arguments));
        },
        post:o.devMode === false ? _.bind(router.post, router) : function () {
            _.bind(router.post, router)(arguments[0], _.last(arguments));
        },
        use:_.bind(router.use, router),
        app:router
    };
};

exports.server = server;
exports.auths = auths;
exports.NotAuthorized = NotAuthorized;
exports.NotAuthenticated = NotAuthenticated;
exports.NotFound = NotFound;
exports.userIs = userIs;
