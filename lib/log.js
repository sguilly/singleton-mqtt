/**
 * Created by sguilly on 24/01/16.
 */


function log(opts, obj) {


    if (opts && opts.logger && Type.is(opts.logger, Object)) {

            obj.trace = opts.logger.trace;
            obj.debug = opts.logger.debug;
            obj.info = opts.logger.info;
            obj.warm = opts.logger.warm;
            obj.error = opts.logger.error;
            obj.fatal = opts.logger.fatal;
    }
    else {

        obj.trace = console.log;
        obj.debug = console.log;
        obj.info = console.log;
        obj.warm = console.log;
        obj.error = console.log;
        obj.fatal = console.log;
    }
}

module.exports = log;