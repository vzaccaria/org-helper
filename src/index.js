var {
    $d, $o, $f, _, $s, $r, withTmp
} = require('zaccaria-cli')

var entry = (filename) => {
    var emit = (o) => {
        console.log(JSON.stringify(o, 0, 4));
    }
    var data = require(`${process.cwd()}/${filename}`)

    var example = (d) => {
        console.log(JSON.stringify(d))
    }

    var histo = (filename, data) => {
        return withTmp((scriptName) => {
            JSON.stringify(data).to(scriptName)

            var s = `library(ggplot2); library(jsonlite); v <- paste(readLines("${scriptName}"), collapse=" "); v <- fromJSON(v); pdf("${filename}"); print(qplot(v, geom="histogram")); dev.off(); quit("no"); `;
            var command = `Rscript --vanilla -e '${s}'`
            return $s.execAsync(command, {
                silent: true
            });
        })
    }


    var cor = (filename, data) => {
        var d = data
        return withTmp((scriptName) => {
            JSON.stringify(d).to(scriptName)

            var s = `library(ggplot2); library(reshape2);  library(jsonlite); v <- paste(readLines("${scriptName}"), collapse=" "); v <- fromJSON(v); pdf("${filename}"); print(qplot(x=Var1, y=Var2, data=melt(cor(v)), fill=value, geom="tile")); dev.off(); quit("no"); `;
            var command = `Rscript --vanilla -e '${s}'`
            return $s.execAsync(command, {
                silent: true
            });
        })
    }

    var filtEq = (prop, value) => {
        return (collection) => {
            return _.filter(collection, (it) => {
                if (_.isArray(value)) {
                    return _.contains(value, it[prop])
                } else {
                    return it[prop] === value;
                }
            })
        }
    }

    var concat = (a, b) => {
        return a.concat(b);
    }

    var filtIndex = (p) => {
        return (collection) => {
            return _.filter(collection, (it, k) => {
                return (p(k));
            })
        }
    }

    var getOdd = filtIndex((it) => (it % 2) !== 0)
    var getEven = filtIndex((it) => (it % 2) === 0)

    var emitFile = (f) => {
        console.log(`file:${f}`)
    }


    _.mixin({
        emitFile, concat, histo, emit, filtEq, filtIndex, getOdd, getEven, cor, example
    })
    return { _, data }
}

module.exports = entry
