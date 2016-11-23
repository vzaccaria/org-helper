var {
     _, $exec, withTmp
} = require('zaccaria-cli');

function readData(dataFileName, opts) {
    var s = `library(ggplot2)
library(jsonlite)
library(reshape2)
v <- paste(readLines("${dataFileName}"), collapse=" ")
v <- fromJSON(v)`;
    if (!_.isUndefined(opts.preProcess)) {
        s = s + `
v <- ${opts.preProcess('v')}`;
    }
    if (opts.verbose) {
        s = s + `
print(v)`;
    }
    return s;
}

let emitFile = (f) => {
    console.log(`file:${f}`);
}

function saveImage(imageFileName, opts) {
    return `ggsave("${imageFileName}", width = ${opts.width}, height = ${opts.height}, units = "cm")
quit("no")`;
}

function execR(s, outputFileName, opts) {
    if(opts.verbose) {
        console.log(s);
    }
    s = s.split('\n').join(';');
    let command = `Rscript --vanilla -e '${s}'`;
    return $exec(command).then(({code, stdout}) => {
        if(code !== 0) {
            console.log(stdout);
        } else {
            emitFile(outputFileName);
        }
    });
}

function withR(filename, data, opts, code) {
    return withTmp((dataFileName) => {
        JSON.stringify(data).to(dataFileName);
        let s = `${readData(dataFileName, opts)}
${code(opts)}
${saveImage(filename, opts)}
`;
        return execR(s, filename, opts);
    });
}

module.exports = {
    saveImage, execR, readData, withR
}
