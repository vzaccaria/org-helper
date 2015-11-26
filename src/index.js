var {
    _, Promise
} = require('zaccaria-cli')

// FIXME:
//
// - move data as first parameter for currying?


let R = require('ramda')
let Table = require('easy-table')
let {
    withR
} = require('./lib/templates.js')
let assert = require('chai').assert




let entry = (filename) => {

    let data = require(`${process.cwd()}/${filename}`)

    let example = (d) => {
        console.log(JSON.stringify(d))
    }

    let exampleTable = (d) => {
        console.log(Table.print(_.take(d, 24)));
    }

    let processOpts = (opts) => {
        let width = _.get(opts, 'width', 5);
        let height = _.get(opts, 'height', 5);
        let xaxis = _.get(opts, 'xaxis', 'v');
        let yaxis = _.get(opts, 'yaxis', 'k');
        let factor = _.get(opts, 'factor', 'variable');
        let verbose = _.get(opts, 'verbose', false)
        return {
            width, height, xaxis, yaxis, factor, verbose
        }
    }

    let histo = (filename, data, opts) => {
        opts = processOpts(opts)
        return withR(filename, data, opts, (opts) => {
            return `qplot(v, geom="histogram", binwidth = 1) + labs(x = "${opts.xaxis}", y= "${opts.yaxis}")`;
        })
    }

    let box = (filename, data, opts, fun) => {
        /* This expects and array of objects { variable: x, value: y } */
        /* You can also use melt to preprocess; in that case, you should specify a different factor */
        if(_.isUndefined(fun)) {
            fun = (x) => x
        }
        opts = processOpts(opts)
        opts.preProcess = fun
        return withR(filename, data, opts, (opts) => {
            return `ggplot(data=v, aes(as.factor(${opts.factor}), value)) + geom_point(alpha=0.05) + labs(x = "${opts.xaxis}", y= "${opts.yaxis}")`;
        })
    }

    let _heat = (filename, data, opts, fun) => {
        if(_.isUndefined(fun)) {
            fun = (x) => x
        }
        opts = processOpts(opts)
        opts.preProcess = fun
        return withR(filename, data, opts, (opts) => {
            return `qplot(x=Var1, y=Var2, data=v, fill=value, geom="tile") + labs(x = "${opts.xaxis}", y= "${opts.yaxis}")`;
        })
    }


    let cor = (filename, data, opts) => {
        return _heat(filename, data, opts, (x) => `melt(cor(${x}))` )
    }

    let filtEq = (prop, value) => {
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

    let concat = (a, b) => {
        return a.concat(b);
    }

    let filtIndex = (p) => {
        return (collection) => {
            return _.filter(collection, (it, k) => {
                return (p(k));
            })
        }
    }

    let getOdd = filtIndex((it) => (it % 2) !== 0)
    let getEven = filtIndex((it) => (it % 2) === 0)


    _.mixin({
        concat, histo, filtEq, filtIndex, getOdd, getEven, cor, example, exampleTable, box
    })
    return {
        _, data, R
    }
}

module.exports = entry
