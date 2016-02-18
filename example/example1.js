/**
 * Created by sguilly on 24/01/16.
 */


var mosca = require("mosca");
var server = new mosca.Server({});

server.on('ready', function()
{
    console.log('server ready');
    var ClientMqtt = require('../index');

    // Don't work with wildcards
    var clientMqtt0 = ClientMqtt.getInstance();

    clientMqtt0.subscribeTopic('+/os',function(message) // No error but don't work !!!
    {
        console.log('mes0=',message);
    });

    // --> See example 2 to get instance of the mqtt client

    // Good way for a single topic subscription

    var clientMqtt1 = ClientMqtt.getInstance();

    clientMqtt1.subscribeTopic('Nkc8yj3Dg/os',function(message)
    {
        console.log('mes1=',message);
    });

    clientMqtt1.publishObj('Nkc8yj3Dg/os',{date: new Date(), value: 56});


    var clientMqtt2 = ClientMqtt.getInstance();

    clientMqtt2.subscribeTopic('TyhiUYh/os',function(message)
    {
        console.log('mes2=',message);
    });

    clientMqtt2.publishObj('TyhiUYh/os',{date: new Date(), value: 78});


    var clientMqtt3 = ClientMqtt.getInstance();

});


