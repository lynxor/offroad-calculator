var _ = require("underscore");

exports.insertBulk = function (insertOneFunc, array, callback) {
    var results = [];

    var inserts = _.map(array, function(obj){
        return function(){
            insertOneFunc(obj, function(err, result){
                results.push( { error: err, result: result} );
                processNext();
            });
        };
    });
    function processNext(){
        if(inserts.length){
            inserts.shift()();
        }
        else callback(null, results);
    }
    processNext();
};