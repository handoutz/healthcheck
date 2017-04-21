module.exports = function() {
    let Argparser = require('argparse').ArgumentParser,
        parser = new Argparser({
            //addHelp: true,
            version: '1',
            description: 'Checks server alive'
        });
    let mode = 'p'; //single ping
    parser.addArgument(['-p', '--ping']);
    parser.addArgument(['-b', '--batch'],{action:'storeTrue'});
    //parser.addArgument('url', {required:false


    let args=parser.parseArgs();
    return args;
};