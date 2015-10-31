"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var _ = _require._;
var $s = _require.$s;
var $r = _require.$r;
var withTmp = _require.withTmp;

var R = require("ramda");

var Table = require("easy-table");

var entry = function (filename) {
    var emit = function (o) {
        console.log(JSON.stringify(o, 0, 4));
    };
    var data = require("" + process.cwd() + "/" + filename);

    var example = function (d) {
        console.log(JSON.stringify(d));
    };

    var exampleTable = function (d) {
        console.log(Table.print(_.take(d, 24)));
    };

    var histo = function (filename, data, opts) {
        if (_.isUndefined(opts)) {
            opts = {};
        }
        var width = opts.width ? opts.width : "5";
        var height = opts.height ? opts.height : "5";
        var labx = opts.xaxis ? opts.xaxis : "v";
        var laby = opts.yaxis ? opts.yaxis : "count";
        return withTmp(function (scriptName) {
            JSON.stringify(data).to(scriptName);
            var s = "library(ggplot2)\n            library(jsonlite)\n            v <- paste(readLines(\"" + scriptName + "\"), collapse=\" \")\n            v <- fromJSON(v)\n            qplot(v, geom=\"histogram\") + labs(x = \"" + labx + "\", y= \"" + laby + "\")\n            ggsave(\"" + filename + "\", width = " + width + ", height = " + height + ", units = \"cm\")\n            quit(\"no\") ";
            s = s.split("\n").join(";");
            var command = "Rscript --vanilla -e '" + s + "'";
            return $s.execAsync(command, {
                silent: true
            });
        });
    };

    var box = function (filename, data, fun, opts) {
        var d = data;
        if (_.isUndefined(opts)) {
            opts = {};
        }
        var width = opts.width ? opts.width : "5";
        var height = opts.height ? opts.height : "5";
        var labx = opts.xaxis ? opts.xaxis : "x";
        var laby = opts.yaxis ? opts.yaxis : "y";
        var factor = opts.factor ? opts.factor : "Var2";
        return withTmp(function (scriptName) {
            JSON.stringify(d).to(scriptName);

            var s = "library(ggplot2)\n            library(reshape2)\n            library(jsonlite)\n            v <- paste(readLines(\"" + scriptName + "\"), collapse=\" \")\n            v <- fromJSON(v)\n            v <- " + fun("v") + "\n            " + (opts.verbose ? "print(v)" : "1") + "\n            ggplot(data=v, aes(as.factor(" + factor + "), value)) + geom_point(alpha=0.05) + labs(x = \"" + labx + "\", y= \"" + laby + "\")\n            ggsave(\"" + filename + "\", width = " + width + ", height = " + height + ", units = \"cm\")\n            quit(\"no\")\n            ";
            s = s.split("\n").join(";");
            var command = "Rscript --vanilla -e '" + s + "'";
            return $s.execAsync(command, {
                silent: opts.verbose ? false : true
            });
        });
    };

    var heat = function (filename, data, fun, opts) {
        var d = data;
        if (_.isUndefined(opts)) {
            opts = {};
        }
        var width = opts.width ? opts.width : "5";
        var height = opts.height ? opts.height : "5";
        var labx = opts.xaxis ? opts.xaxis : "x";
        var laby = opts.yaxis ? opts.yaxis : "y";
        return withTmp(function (scriptName) {
            JSON.stringify(d).to(scriptName);

            var s = "library(ggplot2)\n            library(reshape2)\n            library(jsonlite)\n            v <- paste(readLines(\"" + scriptName + "\"), collapse=\" \")\n            v <- fromJSON(v)\n            " + (opts.verbose ? "print(v)" : "1") + "\n            qplot(x=Var1, y=Var2, data=" + fun("v") + ", fill=value, geom=\"tile\") + labs(x = \"" + labx + "\", y= \"" + laby + "\")\n            ggsave(\"" + filename + "\", width = " + width + ", height = " + height + ", units = \"cm\")\n            quit(\"no\")\n            ";
            s = s.split("\n").join(";");
            var command = "Rscript --vanilla -e '" + s + "'";
            return $s.execAsync(command, {
                silent: opts.verbose ? false : true
            });
        });
    };

    var cor = function (filename, data, opts) {
        return heat(filename, data, function (x) {
            return "melt(cor(" + x + "))";
        }, opts);
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

    var emitFile = function (f) {
        console.log("file:" + f);
    };

    _.mixin({
        emitFile: emitFile, concat: concat, histo: histo, emit: emit, filtEq: filtEq, filtIndex: filtIndex, getOdd: getOdd, getEven: getEven, cor: cor, example: example, exampleTable: exampleTable, heat: heat, box: box
    });
    return { _: _, data: data, R: R };
};

module.exports = entry;
