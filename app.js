var server = require("./js/server.js"),
    restrictedserver = require("./js/restrictedserver");

console.log("Starting ...");
server(require("./default-instance.js"), function(s){
    s.listen();
});
