"use strict";

var _require = require("zaccaria-cli");

var _ = _require._;
var Promise = _require.Promise;

// FIXME:
//
// - move data as first parameter for currying?

var R = require("ramda");
var Table = require("easy-table");

var _require2 = require("./lib/templates.js");

var withR = _require2.withR;

var assert = require("chai").assert;

var entry = function (filename) {
    var data = {};

    if (!_.isUndefined(filename)) {
        data = require("" + process.cwd() + "/" + filename);
    }

    var example = function (d) {
        console.log(JSON.stringify(d));
    };

    var exampleTable = function (d) {
        console.log(Table.print(_.take(d, 24)));
    };

    var processOpts = function (opts) {
        var width = _.get(opts, "width", 5);
        var height = _.get(opts, "height", 5);
        var xaxis = _.get(opts, "xaxis", "v");
        var yaxis = _.get(opts, "yaxis", "k");
        var factor = _.get(opts, "factor", "variable");
        var verbose = _.get(opts, "verbose", false);
        return {
            width: width, height: height, xaxis: xaxis, yaxis: yaxis, factor: factor, verbose: verbose
        };
    };

    var histo = function (filename, data, opts) {
        opts = processOpts(opts);
        return withR(filename, data, opts, function (opts) {
            return "qplot(v, geom=\"histogram\", binwidth = 1) + labs(x = \"" + opts.xaxis + "\", y= \"" + opts.yaxis + "\")";
        });
    };

    var box = function (filename, data, opts, fun) {
        /* This expects and array of objects { variable: x, value: y } */
        /* You can also use melt to preprocess; in that case, you should specify a different factor */
        if (_.isUndefined(fun)) {
            fun = function (x) {
                return x;
            };
        }
        opts = processOpts(opts);
        opts.preProcess = fun;
        return withR(filename, data, opts, function (opts) {
            return "ggplot(data=v, aes(as.factor(" + opts.factor + "), value)) + geom_point(alpha=0.05) + labs(x = \"" + opts.xaxis + "\", y= \"" + opts.yaxis + "\")";
        });
    };

    var dist = function (filename, data, opts, fun) {
        /* This expects and array of objects { variable: x, value: y } */
        /* You can also use melt to preprocess; in that case, you should specify a different factor */
        if (_.isUndefined(fun)) {
            fun = function (x) {
                return x;
            };
        }
        opts = processOpts(opts);
        opts.preProcess = fun;
        return withR(filename, data, opts, function (opts) {
            return "ggplot(data=v, aes(fill=" + opts.factor + ", value)) + geom_histogram(binwidth=0.5, position=\"dodge\") + labs(x = \"" + opts.xaxis + "\", y= \"" + opts.yaxis + "\")";
        });
    };

    var _heat = function (filename, data, opts, fun) {
        if (_.isUndefined(fun)) {
            fun = function (x) {
                return x;
            };
        }
        opts = processOpts(opts);
        opts.preProcess = fun;
        return withR(filename, data, opts, function (opts) {
            return "qplot(x=Var1, y=Var2, data=v, fill=value, geom=\"tile\") + labs(x = \"" + opts.xaxis + "\", y= \"" + opts.yaxis + "\")";
        });
    };

    var cor = function (filename, data, opts) {
        return _heat(filename, data, opts, function (x) {
            return "melt(cor(" + x + "))";
        });
    };

    var filtEq = function (prop, value) {
        return function (collection) {
            return _.filter(collection, function (it) {
                if (_.isArray(value)) {
                    return _.contains(value, it[prop]);
                } else {
                    return it[prop] === value;
                }
            });
        };
    };

    var concat = function (a, b) {
        return a.concat(b);
    };

    var filtIndex = function (p) {
        return function (collection) {
            return _.filter(collection, function (it, k) {
                return p(k);
            });
        };
    };

    var getOdd = filtIndex(function (it) {
        return it % 2 !== 0;
    });
    var getEven = filtIndex(function (it) {
        return it % 2 === 0;
    });

    _.mixin({
        concat: concat, histo: histo, filtEq: filtEq, filtIndex: filtIndex, getOdd: getOdd, getEven: getEven, cor: cor, example: example, exampleTable: exampleTable, box: box, dist: dist
    });
    return {
        _: _, data: data, R: R
    };
};

module.exports = entry;
