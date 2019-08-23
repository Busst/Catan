var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

var game_manager = require('./static/server/GameHandler');
var manager = new game_manager();


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


var users = [];
var users_connected = [];
var users_player = {};
var player_users = {};

// Add the WebSocket handlers
io.on('connection', function(socket) { 
    var uid = null;

    socket.on("name_addition", function(data) {
        if (manager.addPlayer(data)) {
            socket.emit("name good", data);
        } else {
            socket.emit("name bad", "Name already taken");
        }
        if (uid !== null) {
            users_player[uid] = data;
            player_users[data] = uid;
        } else {
            socket.emit('route', 'home');
        }

    });

    socket.on("userLogin", function(user_uid) {
        
        if (users.indexOf(user_uid) < 0) {
            users.push(user_uid);
        }
        
        uid = user_uid;
    });
    socket.on("userGameLogin", function(user_uid) {
        if (users.indexOf(user_uid) < 0) {
            socket.emit('route', 'home');
        } else {
            socket.emit("resource update", manager.playerData(users_player[user_uid]));
        }
        
    });


    socket.on('all', function(data) {
        socket.broadcast.emit('message', data);
    });

    socket.on('commands', function(data) {
        //socket.emit('message', data);
    });

    socket.on('w', function(data) {
        var message = users_player[uid] + ": " + data;
        var broadcast = "whisper" + player_users[data.substring(data.indexOf(' '), data.length)];
        console.log(player_users)
        console.log(users_player)
        console.log(uid);
        console.log(message);
        console.log(broadcast);

        //socket.broadcast.emit('message', data);
    });

    socket.on('r', function(data) {
        //socket.broadcast.emit('message', data);
    });

    socket.on('t', function(data) {
        //socket.broadcast.emit('message', data);

    });

    socket.on("input", function(data) {
        var value = parseInt(data.r_value)
        if (!manager.addResource(data.player, data.r_name, value)) {
            socket.emit('route', 'home');
            return;
        }
        var message = {
            type: 'resource',
            pre: data.player + " received ",
            mes: value + " of " + data.r_name
        }
        var message2 = {
            type: 'message',
            pre: data.player + " received ",
            mes: value + " of " + data.r_name
        }
        socket.emit('message', message);
        socket.broadcast.emit('message', message2);
    });

    socket.on('buy dev card', function(data) {
        var card = manager.buyDevCard(data)
        if (!card) {
            socket.emit('err', 'Can\'t afford dev card');
            return;
        }
        if (card === "empty") {
            var message = {
                type: "message",
                pre: "Development cards are ",
                mes: card
            }
            socket.emit('message', message);
            return;
        }
        var message = {
            type: "card",
            pre: "received: ",
            mes: card
        }
        socket.emit('message', message);
        if (card === "victory card") {
            message = {
                type: "purchase",
                pre: "you received a ",
                mes: "victory point"
            }
            socket.emit('message', message);
        }
        message = {
            type: 'resource',
            pre: users_player[uid] + " received ",
            mes: "-1 of ore"
        }
        socket.emit('message', message);
        message = {
            type: 'resource',
            pre: users_player[uid] + " received ",
            mes: "-1 of sheep"
        }
        socket.emit('message', message);
        message = {
            type: 'resource',
            pre: users_player[uid] + " received ",
            mes: "-1 of grain"
        }
        socket.emit('message', message);
        console.log(users_player[uid] + " dev bought: " + card);
    })

    socket.on('buy road', function(data) {
        
        if (!manager.buyRoad(data)) {
            socket.emit('err', 'Couldn\'t purchase road');
            return;
        }
        var message = {
            type: "purchase",
            pre: "received: ",
            mes: "road"
        }
        socket.emit('message', message);
        
        var message2 = {
            type: "purchase",
            pre: data + " received a",
            mes: "road"
        }
        socket.broadcast.emit('message', message2);
        message = {
            type: 'resource',
            pre: users_player[uid] + " received ",
            mes: "-1 of lumber"
        }
        socket.emit('message', message);
        message = {
            type: 'resource',
            pre: users_player[uid] + " received ",
            mes: "-1 of brick"
        }
        socket.emit('message', message);
    })

    socket.on('buy settlement', function(data) {
        
        if (!manager.buySettlement(data)) {
            socket.emit('err', 'Couldn\'t purchase settlement');
            return;
        }
        var message = {
            type: "purchase",
            pre: "received: ",
            mes: "settlement"
        }
        socket.emit('message', message);
        
        var message3 = {
            type: "purchase",
            pre: "you received a ",
            mes: "victory point"
        }
        
        socket.emit('message', message3);
        var message2 = {
            type: "purchase",
            pre: data + " received a",
            mes: "settlement"
        }
        socket.broadcast.emit('message', message2);
        message = {
            type: 'resource',
            pre: users_player[uid] + " received ",
            mes: "-1 of lumber"
        }
        socket.emit('message', message);
        message.mes = "-1 of sheep";
        socket.emit('message', message);
        message.mes = "-1 of grain";
        socket.emit('message', message);
        message.mes = "-1 of brick";
        socket.emit('message', message);
    })

    socket.on('buy city', function(data) {
        
        if (!manager.buyCity(data)) {
            socket.emit('err', 'Couldn\'t purchase city');
            return;
        }
        var message = {
            type: "purchase",
            pre: "received: ",
            mes: "city"
        }
        var message2 = {
            type: "purchase",
            pre: data + " received a",
            mes: "city"
        }
        socket.broadcast.emit('message', message2);
        socket.emit('message', message);
        var message3 = {
            type: "purchase",
            pre: "you received a ",
            mes: "victory point"
        }
        socket.emit('message', message3);
        message = {
            type: 'resource',
            pre: users_player[uid] + " received ",
            mes: "-3 of ore"
        }
        socket.emit('message', message);
        message.mes = "-2 of grain";
        socket.emit('message', message);
    })
});

