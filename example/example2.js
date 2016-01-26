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


    var clientMqtt0 = new ClientMqtt(opts).getInstance();

    clientMqtt0.subscribe('+/os', {qos: 0});

    clientMqtt0.on('message', function(topic,message)
    {
        console.log('0=',topic, message);
    });


    var clientMqtt1 = new ClientMqtt(opts).getInstance();

    clientMqtt1.subscribe('THYUI/os', {qos: 0});

    clientMqtt1.on('message', function(topic,message)
    {
        console.log('1=',topic, message);
    });

    clientMqtt1.publish('THYUI/os',JSON.stringify(new Date()));



    var clientMqtt2 = new ClientMqtt(opts).getInstance();

    clientMqtt2.subscribe('OLKKOK/os', {qos: 0});

    clientMqtt2.on('message', function(topic,message)
    {
        console.log('2=',topic, message);
    });

    clientMqtt2.publish('OLKKOK/os',JSON.stringify(new Date()));

    setTimeout(function()
    {
        server.close();
    }, 2000);

    setTimeout(function()
    {
        console.log('clientMqtt2 =',new ClientMqtt().getStatus());
    }, 5000);

    setTimeout(function()
    {
        console.log('clientMqtt2 =',new ClientMqtt().getStatus());
    }, 10000);

});



