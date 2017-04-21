let request = require('request'),
    colors = require('colors'),
    winston = require('winston'),
    async = require('async'),
    PrettyError = require('pretty-error'),
    config = require('config');
let cfg = require('./argument')();

var pe = new PrettyError();
pe.skipNodeFiles();
request.defaults({
    pool: {
        maxSockets: Infinity
    }
});

function poke(url, cb) {
    request(url, {
        timeout: 5000,
        time: true
    }, function(error, resp, bod) {
        if (error) {
            var errtxt = pe.render(error);
            winston.error(errtxt, {
                url: url
            });
            winston.error('error occurred', {
                url: url
            });
            cb(error);
        } else if (resp.statusCode != 200) {
            var code = resp.statusCode.toString();
            if (code > 300 && code < 400) {
                code = code.yellow;
                winston.warn({
                    url: url.bold.yellow,
                    statusCode: resp.statusCode.toString().bold.yellow,
                    totalTime: Math.floor(resp.timings.response - resp.timings.connect).toString() + "ms"
                });
            } else {
                code = code.red;
                winston.error({
                    url: url.bold.red,
                    statusCode: resp.statusCode.toString().bold.red,
                    totalTime: Math.floor(resp.timings.response - resp.timings.connect).toString() + "ms"
                });
            }
        } else {
            winston.info({
                url: url,
                statusCode: '200'.green,
                totalTime: Math.floor(resp.timings.response - resp.timings.connect).toString() + "ms"
            });
        }
        if (resp.statusCode) cb(null, resp.statusCode);
    });
}
if (cfg.batch) {
    var urls = config.get('batch.urls');
    async.each(urls, function(result, cb_results) {
        poke(result, cb_results);
    }, function(err) {
        if (err) {
            console.log(pe.render(err));
        }
    });
} else if (cfg.ping) {
    poke(cfg.ping, function(err, code) {
        code = code.toString();
        if (code == 200) code = code.green;
        else if (code > 300 && code < 400) code = code.yellow;
        else code = code.red;
        console.log(cfg.ping + ": " + code);
    })
}