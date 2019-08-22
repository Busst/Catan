var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);

var io = socketIO(server);

app.set('port', 3000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'pages/init.html'));
});
app.get('/game', function(request, response) {
    
    response.sendFile(path.join(__dirname, 'pages/index.html'));
});

// Starts the server.
server.listen(3000, function() {
    console.log('Starting server on port 3000');
});

// Add the WebSocket handlers
io.on('connection', function(socket) { 
    idToSocket[players] = socket;
    socket.on("name_addition", function(data) {
        if (checkName(data)) {
            idToPlayer[players] = data;
            socket.emit("name good", data);
            players++;
        } else {
            socket.emit("name bad", "Name already taken");
        }
    });

    socket.on('all', function(data) {
        socket.broadcast.emit('message', data);
    });

    socket.on('help', function(data) {
        socket.broadcast.emit('message', data);
    });

    socket.on('w', function(data) {
        //socket.broadcast.emit('message', data);
    });

    socket.on('r', function(data) {
        //socket.broadcast.emit('message', data);
    });

    socket.on('t', function(data) {
        socket.broadcast.emit('message', data);
    });

});

function checkName(name) {
    if (name.length <= 0) {
        return false;
    }
    for (var n in idToPlayer) {
        if (idToPlayer[n] === name) {
            return false;
        }
    }
    return true;
}



var idToSocket = [];
var playerToId = {};
var idToPlayer = [];

var players = 0;