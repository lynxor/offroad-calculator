var _ = require("underscore"),
    rs = require("./restrictedserver.js"),
    a = require("./restrictedserver.js").auths,
    async = require("async");

exports.on = function (providers, roles, assetToken) {

    var roleSelects = function (req, user) {
        return _.chain(_.range(roles.length)).zip(roles).filter(
            function (x) {
                if (rs.userIs(req.user, "client")) {
                    return x[1] !== "admin";
                }
                return x;
            }).map(
            function (r) {
                return {
                    name:r[1],
                    index:r[0],
                    checked:rs.userIs(user, r[1])
                };
            }).value();
    };


    var userProvider = providers.userProvider,
        findOneUser = function (email, res, cb) {
            userProvider.retrieveByEmail(email, function (err, user) {
                if (user) {
                    cb(user);
                } else if (err) {
                    res.writeHead(500, {"Content-type":"text/html"});
                    res.end("Error: " + err);
                } else {
                    res.writeHead(404, {"Content-type":"text/html"});
                    res.end("no such user: " + email);
                }
            });
        },
        add_user = function (req, res) {
            var user = _.extend(userProvider.emptyUser(), {
                "password":req.body.password,
                "email":req.body.email,
                "role":{name:"norole"}
            });


            providers.userProvider.insert(user, function (err, result) {
                if (typeof(err) !== "undefined") {
                    res.redirect("/admin/edit/" + user.email);
                } else {
                    res.writeHead(500, {"Content-type":"text/html"});
                    res.end("<html>An error occurred: " + err + "</html>");
                }
            });
        },
        save_user = function (req, res) {
            findOneUser(req.params.email, res, function (user) {
                var newUser = user;
                _(["firstname", "lastname"]).each(function (prop) {
                    newUser[prop] = req.body[prop];
                });
                if (req.body.role) {
                    newUser.role = {name:req.body.role};
                }
                userProvider.update(newUser, function (err, user) {
                    res.redirect("/admin");
                }, function (err) {
                    res.end("Error: " + err);
                });
            });
        },
        edit_user = function (req, res) {
            userProvider.retrieveAll(function (err, users) {
                if (err) users = [];
                findOneUser(req.params.email, res, function (user) {

                    res.render('useredit.jade', {userToEdit:_.extend(userProvider.emptyUser(), user), roles:roleSelects(req, user), user:req.user, asset_token:assetToken, users:users});
                });

            });
        },
        edit_user_client = function (req, res, next) {
            userProvider.retrieveAll(function (err, users) {
                users = _(users).filter(function (x) {
                    return !rs.userIs(x, "admin");
                });
                if (err) users = [];
                findOneUser(req.params.email, res, function (user) {
                    if (rs.userIs(user, "admin")) {
                        return next();
                    }
                    res.render('useredit.jade', {userToEdit:_.extend(userProvider.emptyUser(), user), roles:roleSelects(req, user), user:req.user, asset_token:assetToken, users:users});
                });

            });
        },
        profile = function (req, res) {
            userProvider.retrieveByEmail(req.params.email, function (err, user) {
                if (!err && user) {
                    res.render("profile.jade", {userToEdit:_.extend(userProvider.emptyUser(), user), roles:roleSelects(req, user) });
                }
                else {
                    res.render("500.jade", "Please provide a valid user");
                }
            });
        },
        changePassword = function (req, res) {
            var newPwd = req.body.newpassword,
                repeat = req.body.repeat,
                oldPwd = req.body.oldpassword;

            userProvider.retrieve(req.params.email, oldPwd, function (err, theuser) {
                if (!err && theuser) {

                    if (newPwd !== repeat) {
                        req.flash("error", "New passwords do not match");
                        res.render("change_password.jade", {userToEdit:theuser});
                    } else if (newPwd.length < 7) {
                        req.flash("error", "Password must be at least 7 characters long");
                        res.render("change_password.jade", {userToEdit:theuser});
                    } else {
                        userProvider.changePassword(req.params.email, newPwd, function (err, docs) {
                            if (!err && docs) {
                                req.flash("info", "Password changed successfully");
                                res.render("profile.jade", {userToEdit:theuser, roles:roleSelects(req, theuser)});
                            }
                        });

                    }

                }
                else {
                    userProvider.retrieveByEmail(req.params.email, function (err, theuser) {
                        req.flash("error", "Invalid password");
                        res.render("change_password.jade", {userToEdit:theuser});
                    });
                }
            });
        },
        viewChangePassword = function (req, res) {
            userProvider.retrieveByEmail(req.params.email, function (err, theuser) {
                res.render("change_password.jade", {userToEdit:theuser});
            });
        };


    return function (router) {
        router.get("/admin", a.hasRole("admin"), a.skipOnFail, function (req, res) {
            userProvider.retrieveAll(function (err, users) {
                if (err) users = [];
                res.render('admin.jade', {users:users, user:req.user, asset_token:assetToken});
            });
        });
        router.get("/admin", a.hasRole("client"), a.skipOnFail, function (req, res) {
            userProvider.retrieveAll(function (err, users) {
                if (err) users = [];
                res.render('admin.jade', {
                    users:_(users).filter(function (x) {
                        return !rs.userIs(x, "admin");
                    }),
                    user:req.user,
                    asset_token:assetToken
                });
            });
        });
        // Fallback - authorization error
        router.get("/admin", a.isAuthenticated, a.showAuthorizationError);

        router.get("/admin/edit/:email", a.hasRole("admin"), a.skipOnFail, edit_user);
        router.get("/admin/edit/:email", a.hasRole("client"), a.skipOnFail, edit_user_client);
        router.get("/admin/edit/:retrieveByEmail", a.isAuthenticated, a.showAuthorizationError);

        router.post("/admin/add", a.hasAnyRole("admin", "client"), add_user);
        router.post("/admin/edit/:email", a.hasAnyRole("admin", "client"), save_user);

        router.get("/profile/:email", a.hasAnyRole("admin", "supervisor", "client", "collector"), profile);


        router.get("/user/changepassword/:email", a.hasAnyRole("admin", "supervisor", "client", "collector"), viewChangePassword);
        router.post("/user/changepassword/:email", a.hasAnyRole("admin", "supervisor", "client", "collector"), changePassword);
    };
};
