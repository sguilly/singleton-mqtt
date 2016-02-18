/**
 * Created by sguilly on 24/01/16.
 */


var mosca = require("mosca");
var server = new mosca.Server({});

server.on('ready', function()
{
    var ClientMqtt = require('../index');

    var opts = {
        name: 'mqttTest',
        mqtt: {
            ip: 'localhost',
            debug: true,
            watchdog: { minute: 5, cb: function(){process.exit(1);} } //minutes
        }
    };


    var clientMqtt0 = ClientMqtt.getInstance(opts);

    clientMqtt0.on('event',function(type)
    {
        console.log('0 event=',type);
    });

    clientMqtt0.mqtt.on('connect', function()
    {
        console.log('connect out');

        clientMqtt0.mqtt.subscribe('+/os', {qos: 0});



        clientMqtt0.mqtt.on('message', function(topic,message)
        {
            console.log('0=',topic, message);
        });


        var clientMqtt1 = ClientMqtt.getInstance(opts);

        clientMqtt1.mqtt.subscribe('THYUI/os', {qos: 0});

        clientMqtt1.mqtt.on('message', function(topic,message)
        {
            console.log('1=',topic, message);
        });

        clientMqtt1.mqtt.publish('THYUI/os',JSON.stringify(new Date()));



        var clientMqtt2 = ClientMqtt.getInstance(opts);

        clientMqtt2.mqtt.subscribe('OLKKOK/os', {qos: 0});

        clientMqtt2.mqtt.on('message', function(topic,message)
        {
            console.log('2=',topic, message);
        });

        clientMqtt2.mqtt.publish('OLKKOK/os',JSON.stringify(new Date()));

        setTimeout(function()
        {
            server.close();

            console.log('>tata');

            var clientMqtt6 = ClientMqtt.getInstance(opts);
            clientMqtt6.mqtt.publish('THYUI/os','tata',{qos:1},function(a,b)
            {
                console.log(a,b);
            });
        }, 2000);

        clientMqtt2.publishObj('THYUI/os','tata');

        setTimeout(function()
        {
            console.log('clientMqtt2 =',ClientMqtt.getInstance().getStatus());
        }, 5000);

        setTimeout(function()
        {
            console.log('clientMqtt2 =',ClientMqtt.getInstance().getStatus());
        }, 10000);
    })




});



