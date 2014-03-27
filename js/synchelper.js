var _ = require("underscore");

/**
  * Takes a variable number of arguments of the form:
  *   function (callback, ...) { }
  * each of which must call callback when they are done.
  * the ... will be any additional parameters from the previous step as
  * the first parameter of all functions is partially applied to be the callback
  * on creation of sequence.
  *
  * Returns a function of the form
  *   function (callback, ...) { } as well
  * Callback function will be called when all are done
  * additional arguments past the first will be passed to first function
  * in the outer argument list
  */
var waitForAll = function (/*...*/) {
    var doneCallback,
        callback = function () {
            if (actions.length) {
                actions.shift().apply(null,arguments);
            } else {
                doneCallback.apply(null, arguments);
            }
        },
        actions = _(!_.isArray(arguments[0]) ? arguments : arguments[0]).map(function (f) {
          return _.bind(f, f, callback);
        });

    return function (done) {
      if (!_.isFunction(done)) {
        throw new Error("Must specify a callback");
      }
      doneCallback = _.first(arguments);
      callback.apply(callback, _.tail(arguments));
    };
};

/**
 * Same behaviour as waitForAll, but specialized for work with callback functions.
 *
 * All functions will be wrapped in a function of the form (callback, err, ...).
 * Your function simply takes (callback, ...).
 * If an error occurs, call callback with a non-null first argument, ie. callback("invalid")
 * Else, call with null or undefined, ie. callback(null, "arg1", "arg2")
 *
 * if any err argument in the chain is non-undefined, the whole sequence is considered
 * errorneous and no further processing is done.
 *
 * In this case the final callback will be called with the err argument of the failed
 * step as the first arg.
 * Otherwise, behaves exactly like waitForAll.
 *
 */
var callbacks = function (/*...*/) {
  var doneCallback,
    wrapped = _(!_.isArray(arguments[0]) ? arguments : arguments[0]).map(function (f) {
      return function (/*, ...*/) {
        var args = _.toArray(arguments),
          callback = args.shift(),
          err = args.shift();
        if (err) {
          return doneCallback(err);
        }
        f.apply(f, [callback].concat(args));
      };
    });
  
  return function (done) {
    if (!_.isFunction(done)) {
      throw new Error("Must specify a callback");
    }
    doneCallback = done;
    waitForAll(wrapped)(function () {
      var args = _.toArray(arguments),
        err = args.shift();
      if (err) {
        return done(err);
      }
      done.apply(done, [null].concat(_.toArray(args)));
    });
  };
};

/**
 * Prepend a static argument to a callback function if it is successfull.
 */
var spush = function (callback, arg) {
  if (!_.isFunction(callback)) {
    throw new Error("Must specify a callback");
  }
  return function () {
    var args = _.toArray(arguments),
      err = args.shift();
    if (err) {
      return callback(err);
    }
    callback.apply(null, (arg ? [null, arg] : [null]).concat(args));
  };
};

var collect = function (f) {
    return function (callback) {
        var args1 = _.toArray(arguments);
        args1.shift();
        f(function () {
            var args2 = _.toArray(arguments);
            Function.prototype.bind.apply(callback, [null].concat(args1).concat(args2))();
        });
    };
};

var collect_callback = function (f) {
    return function (callback) {
        var args1 = _.toArray(arguments);
        args1.shift();
        f(function () {
            var args2 = _.toArray(arguments),
              err = args2.shift();
            if (err) {
              return callback(err);
            }
            Function.prototype.bind.apply(callback, [null, null].concat(args1).concat(args2))();
        });
    };
};

var sync_callback = function (f) {
  return function (callback) {
    f();
    callback();
  };
};
exports.waitForAll = waitForAll;
exports.callbacks = callbacks;
exports.spush = spush;
exports.collect = collect;
exports.collect_callback = collect_callback;
exports.sync_callback = sync_callback;
