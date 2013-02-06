var email = require("emailjs"),
    _ = require("underscore");


var Mailer = function (config) {

    var server = email.server.connect({
        user:config.user,
        password:config.password,
        host:config.host,
        port:config.port,
        ssl:config.ssl}),
        defaults = {
            from:config.from,
            cc:"",
            subject:"Mail from template project"
        }


    return {
        //callback should take 2 params (err, mesg)
        send: function (email_to_send, callback) {
            server.send(_.extend(defaults, email_to_send), callback);
        },
        sendHtml: function (htmlMsg, email_to_send, callback) {
            var message = email.message.create(_.extend(defaults, email_to_send));

            message.attach({data:htmlMsg, alternative:true});
            server.send(message, callback);
        }
    };
};

exports.Mailer = Mailer;