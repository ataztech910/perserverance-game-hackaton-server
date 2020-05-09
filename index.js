var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 8081,function() { // Listens to port 8081 or auto from deploy
    console.log('Listening on '+ server.address().port);
});