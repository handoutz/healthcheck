let request = require('request'),
	colors=require('colors'),
	winston=require('winston'),
	async=require('async'),
	PrettyError=require('pretty-error'),
	config=require('config');
let cfg = require('./argument')();

var pe = new PrettyError();
pe.skipNodeFiles();

function poke(url, cb) {
    request(url, {timeout: 5000,time:true}, function(error, resp, bod) {
        if (error) {
            //console.error(url+"errored: ".red+error.toString());
            //console.log(url.red+" errored");
            //console.log(url.red + " encountered an error");
            var errtxt=pe.render(error);
            winston.error(errtxt, {url:url});
            winston.error('error occurred', {url: url});
        } else if (resp.statusCode != 200) {
        	//console.error(url+'\n\tstatusCode='+resp.statusCode.toString().red);
        	//console.log(url.yellow);
        	//console.log("\tstatusCode="+resp.statusCode.toString().yellow);
        	winston.error({url:url.bold.red,statusCode: resp.statusCode.toString().bold.red,});
        } else {
        	//console.log(url.toString().green);
        	winston.info({url:url, statusCode: '200'.green, totalTime: Math.floor(resp.timings.response - resp.timings.connect).toString()+"ms"});
            /*{ 'accept-ranges': 'bytes',
                'cache-control': 'max-age=604800',
                'content-type': 'text/html',
                date: 'Fri, 21 Apr 2017 02:14:41 GMT',
                etag: '"359670651+gzip"',
                expires: 'Fri, 28 Apr 2017 02:14:41 GMT',
                'last-modified': 'Fri, 09 Aug 2013 23:54:35 GMT',
                server: 'ECS (mdw/1275)',
                vary: 'Accept-Encoding',
                'x-cache': 'HIT',
                'content-length': '1270',
                connection: 'close' } },*/

        }
    });
}
var urls=config.get('batch.urls');
async.each(urls, function (result, cb_results) {
   poke(result);
}, function (err) {
    if (err) { throw err; }
});

//console.dir(urls);
//poke();