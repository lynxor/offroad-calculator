var _ = require("underscore");

exports.on = function (providers, mailer) {
    var userProvider = providers.userProvider,
        reset_password = function (req, res) {
            var email_address = req.body.email;
            userProvider.retrieveByEmail(email_address, function (err, user) {
                if (err || !user) {
                    req.flash("error","Could not reset - unknown email address");
                    res.render("password_reset.jade");
                }
                else {
                    userProvider.resetPassword(email_address, function (err, newPwd) {
                        var email = {
                            text:"Your new password is : " + newPwd,
                            from:"Admin <blahblah@blahblah.com>",
                            to:user.username + "<" + user.email + ">",
                            subject:"Password reset"  };
                        mailer.send(email, function (err, msg) {
                            if (err) {
                                req.flash("error", "An unknown error has occurred.");
                                res.render("password_reset.jade");
                            }
                            else {
                                req.flash("info", "Your password has been reset and mailed to you");
                                res.render("login.jade");
                            }
                        });
                    });
                }
            });
        };

    return function (router) {
        router.get("/user/reset", function (req, res) {
            req.flash("info", "Provide an email to send your new password to");
            res.render("password_reset.jade");
        });
        router.post("/user/reset", reset_password);
    };
};
