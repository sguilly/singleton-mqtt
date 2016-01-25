/**
 * Created by sguilly on 23/01/16.
 */

"use strict";

var createSingleton = require('./createSingleton');

var shortid = require('shortid');
var typeName = require('type-name');

var mqtt = require('mqtt');

function clientMqtt(opts) {

    if(opts == null)
    {
        opts = {};
    }

    if(opts.mqtt == null)
    {
        opts.mqtt = {};
    }

    var mqttParams =
    {
        port: opts.mqtt.port ? opts.mqtt.port : 1883,
        host: opts.mqtt.ip ? opts.mqtt.ip : 'localhost',
        qos: opts.mqtt.qos ? opts.mqtt.qos : 0,
        clean: false,
        encoding: 'utf8',
        clientId: ( opts.name ? opts.name : 'mqtt') + '-' + shortid.generate(),
        protocolId: 'MQIsdp',
        protocolVersion: 4
    };

    var mqttState = 0;

    var callbackTopics = [];

    var that = this;
    require('./log')(opts, this);

    var client = mqtt.connect(mqttParams);

    client.on('connect', function () {

        that.info('connect');

        mqttState = 1;
    });

    client.on('reconnect', function () {

        that.info('reconnect');
    });

    client.on('close', function () {

        that.info('close');

        mqttState = 1;
    });

    client.on('offline', function () {

        that.info('offline');

        mqttState = 0;
    });

    client.on('error', function () {

        that.error('error');

        mqttState = 0;
    });

    client.on('close', function () {

        that.error('error');
    });

    client.on('message',function(topic,message)
    {

        watchdogCnt = 0;

        var cb = callbackTopics[topic];

        if(cb)
        {
            cb(message.toString());
        }

    });

    this.subscribeTopic = function (topic,callback) {
        this.trace('active topic=', topic);

        client.subscribe(topic, {qos: mqttParams.qos});

        callbackTopics[topic] = callback;
    };


    this.publish = function (topic,obj) {


        client.publish(topic,JSON.stringify(obj),{qos: mqttParams.qos});

    };

    this.getInstance = function()
    {
        return client;
    };

    var watchdogCnt = 0;
    var loop = function (duration) {

        setTimeout(function () {

            if(watchdogCnt > 50)
            {
                //doSomething()
            }

            watchdogCnt++;
            process.stdout.write("" + watchdogCnt);
            loop(duration);
        }, duration);
    };

    loop(5000);

}

module.exports = createSingleton(clientMqtt);