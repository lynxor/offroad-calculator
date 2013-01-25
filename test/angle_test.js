var assert = require("assert"),
    angles = require("angles");

module.exports = {
    setup: function(callback){

    },
    treadTest: function(callback){
        assert.deepEqual(763.4, angles.tyreDiameter(255, 70, 16));
    }
};