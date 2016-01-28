/**
 * Created by sguilly on 23/01/16.
 */

"use strict";

var createSingleton = require('./createSingleton');

var shortid = require('shortid');

var mqtt = require('mqtt');

function clientMqtt(opts) {

    if (opts == null) {
        opts = {};
    }

    if (opts.mqtt == null) {
        opts.mqtt = {};
    }

    if (opts.mqtt.debug && opts.mqtt.debug === true) {
        var debug = console.log;
        var colors = require('colors');
    }
    else {
        var debug = function () {
        };
    }

    var mqttParams =
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

    var callbackTopics = [];

    var that = this;

    var client = mqtt.connect(mqttParams);

    client.on('connect', function () {

        debug('connect'.green);

        mqttState = 1;
    });

    var reconnectCnt = 0;

    client.on('reconnect', function () {

        debug('reconnect'.yellow);

        mqttState = 1;

        reconnectCnt++;

    });

    client.on('close', function () {

        debug('close'.red);

        mqttState = 0;
    });

    client.on('offline', function () {

        debug('offline'.red);

        mqttState = 0;
    });

    client.on('error', function () {

        debug('error'.red);

        mqttState = 0;
    });

    client.on('message', function (topic, message) {
        var cb = callbackTopics[topic];

        if (cb) {
            cb(message.toString());
        }

    });

    this.subscribeTopic = function (topic, callback) {
        debug(('active topic=' + topic).green);

        client.subscribe(topic, {qos: mqttParams.qos});

        callbackTopics[topic] = callback;
    };


    this.publish = function (topic, obj) {

        client.publish(topic, JSON.stringify(obj), {qos: mqttParams.qos});

    };

    this.getInstance = function () {
        return client;
    };

    this.getStatus = function () {
        return {state: mqttState, reconnect: reconnectCnt, time: timeFromStarted};
    };

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

}

module.exports = createSingleton(clientMqtt);