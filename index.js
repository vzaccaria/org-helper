"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var _ = _require._;
var $s = _require.$s;
var $r = _require.$r;
var withTmp = _require.withTmp;

var entry = function (filename) {
    var emit = function (o) {
        console.log(JSON.stringify(o, 0, 4));
    };
    var data = require("" + process.cwd() + "/" + filename);

    var example = function (d) {
        console.log(JSON.stringify(d));
    };

    var histo = function (filename, data) {
        return withTmp(function (scriptName) {
            JSON.stringify(data).to(scriptName);

            var s = "library(ggplot2); library(jsonlite); v <- paste(readLines(\"" + scriptName + "\"), collapse=\" \"); v <- fromJSON(v); pdf(\"" + filename + "\"); print(qplot(v, geom=\"histogram\")); dev.off(); quit(\"no\"); ";
            var command = "Rscript --vanilla -e '" + s + "'";
            return $s.execAsync(command, {
                silent: true
            });
        });
    };

    var cor = function (filename, data) {
        var d = data;
        return withTmp(function (scriptName) {
            JSON.stringify(d).to(scriptName);

            var s = "library(ggplot2); library(reshape2);  library(jsonlite); v <- paste(readLines(\"" + scriptName + "\"), collapse=\" \"); v <- fromJSON(v); pdf(\"" + filename + "\"); print(qplot(x=Var1, y=Var2, data=melt(cor(v)), fill=value, geom=\"tile\")); dev.off(); quit(\"no\"); ";
            var command = "Rscript --vanilla -e '" + s + "'";
            return $s.execAsync(command, {
                silent: true
            });
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

    var emitFile = function (f) {
        console.log("file:" + f);
    };

    _.mixin({
        emitFile: emitFile, concat: concat, histo: histo, emit: emit, filtEq: filtEq, filtIndex: filtIndex, getOdd: getOdd, getEven: getEven, cor: cor, example: example
    });
    return { _: _, data: data };
};

module.exports = entry;
