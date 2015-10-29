var {
    $d, $o, $f, _, $s, $r, withTmp
} = require('zaccaria-cli')

var R = require('ramda')

var Table = require('easy-table')

var entry = (filename) => {
    var emit = (o) => {
        console.log(JSON.stringify(o, 0, 4));
    }
    var data = require(`${process.cwd()}/${filename}`)

    var example = (d) => {
        console.log(JSON.stringify(d))
    }

    var exampleTable = (d) => {
        console.log(Table.print(_.take(d, 24)));
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

    var heat = (filename, data, fun, opts ) => {
        var d = data
        if(_.isUndefined(opts)) {
            opts = {}
        }
        return withTmp((scriptName) => {
            JSON.stringify(d).to(scriptName)
            var s = `library(ggplot2)
            library(reshape2)
            library(jsonlite)
            v <- paste(readLines("${scriptName}"), collapse=" ")
            v <- fromJSON(v)
            ${ opts.verbose ? 'print(v)' : '1'}
            pdf("${filename}")
            print(qplot(x=Var1, y=Var2, data=${fun('v')}, fill=value, geom="tile"))
            dev.off()
            quit("no")
            `;
            s = s.split('\n').join(';');
            var command = `Rscript --vanilla -e '${s}'`
            return $s.execAsync(command, {
                silent: (opts.verbose? false : true)
            });
        })
    }


    var cor = (filename, data) => {
        return heat(filename, data, (x) => `melt(cor(${x}))`)
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
        emitFile, concat, histo, emit, filtEq, filtIndex, getOdd, getEven, cor, example, exampleTable, heat
    })
    return { _, data, R}
}

module.exports = entry
