var util         = require("util");
var EventEmitter = require("events").EventEmitter;
var mqtt = require('mqtt');

var extend = require('extend');



var SingletonMqtt = (function() {

    var constructeur = function  (opts) {

        if (typeof opts === 'undefined') {
            opts = {};
        }

        if (typeof opts.mqtt === 'undefined') {
            opts.mqtt = {};
        }

        if (opts.mqtt.debug && opts.mqtt.debug === true) {
            this.debug = console.log;
            var colors = require('colors');
        }
        else {
            this.debug = function () {
            };
        }

        this.mqttParams =
        {
            port: opts.mqtt.port ? opts.mqtt.port : 1883,
            host: opts.mqtt.ip ? opts.mqtt.ip : 'localhost',
            qos: opts.mqtt.qos ? opts.mqtt.qos : 0,
            clean: false,
            encoding: 'utf8',
            clientId: ( opts.name ? opts.name +'-log' : 'mqttClient'),
            protocolId: 'MQIsdp',
            protocolVersion: 4
        };

        var mqttState = 0;

        this.callbackTopics = [];

        var clientMqtt = mqtt.connect(this.mqttParams);

        this.mqtt = clientMqtt;

        var that = this;

        clientMqtt.on('connect', function () {

            for(var topic in that.callbackTopics){

                that.debug('subscribe to:',topic);
                clientMqtt.subscribe(topic, {qos: that.mqttParams.qos});
            }

            that.debug('connect'.green);

            that.emit('event','connect');

            mqttState = 1;
        });

        var reconnectCnt = 0;

        clientMqtt.on('reconnect', function () {

            that.debug('reconnect'.yellow);

            mqttState = 1;

            reconnectCnt++;

            that.emit('event','reconnect');

        });

        clientMqtt.on('close', function () {

            that.debug('close'.red);

            mqttState = 0;

            that.emit('event','close');
        });

        clientMqtt.on('offline', function () {

            that.debug('offline'.red);

            mqttState = 0;

            that.emit('event','offline');
        });

        clientMqtt.on('error', function () {

            that.debug('error'.red);

            mqttState = 0;

            that.emit('event','error');
        });

        clientMqtt.on('message', function (topic, message) {

            var cb = that.callbackTopics[topic];

            if (cb) {
                try{
                    cb(JSON.parse(message.toString()));
                }
                catch(e)
                {
                    cb(message.toString());
                }
            }

        });

        var watchdogCnt = 0;
        var timeFromStarted = 0;

        var loop = function (duration) {

            setTimeout(function () {

                if (opts.mqtt.watchdog) {
                    if (mqttState === 0) {
                        watchdogCnt++;
                    }
                    else {
                        watchdogCnt = 0;
                    }

                    if (watchdogCnt > opts.mqtt.watchdog.minute) {
                        console.log('not connected for a long time !!!'.red);

                        opts.mqtt.watchdog.cb();


                    }
                }

                timeFromStarted++;

                loop(duration);
            }, duration);
        };


        loop(60000);


        this.getStatus = function () {
            return {state: mqttState, reconnect: reconnectCnt, time: timeFromStarted};
        };

        EventEmitter.call(this);
    };

    util.inherits(constructeur, EventEmitter);

    constructeur.prototype.publishObj = function (topic,obj) {

        this.mqtt.publish(topic,JSON.stringify(obj),{qos: this.mqttParams.qos});

    };

    constructeur.prototype.subscribeTopic = function (topic, callback) {
        this.debug(('active topic=' + topic).green);

        this.mqtt.subscribe(topic, {qos: this.mqttParams.qos});

        this.callbackTopics[topic] = callback;
    };

    var instance = null;
    return new function() {
        this.getInstance = function(opts) {
            if (instance == null) {
                instance = new constructeur(opts);
                instance.constructeur = null;

            }

            return instance;
        }
    }
})();

module.exports = SingletonMqtt;

