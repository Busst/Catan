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
    console.log('Starting server on 10.0.1.11:3000');
});

setInterval(function(){
    for (var name in player_users) {
        console.log(name);
        console.log(manager.playerData(name));
        console.log('\n');
        
    }
}, 10000)



var users_player = {};
var player_users = {}; 
var events = {};

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
            users_player[uid] = {
                name: data,
                socket_id: socket.id
            };
            player_users[data] = socket;
            socket.emit("resource update", {name: data,data: manager.playerData(data)});
            socket.broadcast.emit("message", {type: 'message', pre: data, mes: ' connected!'})
            events[data] = [];
        } else {
            socket.emit('route', 'home');
        }

    });

    socket.on("userLogin", function(user_uid) {     
        uid = user_uid;
        
    });
    socket.on("userGameLogin", function(user_uid) {
        if (users_player[user_uid] === undefined) {    
            socket.emit('route', 'home');
            return;
        }
        uid = user_uid;
        
        var player_name = users_player[user_uid].name;
        player_users[player_name] = socket;
        users_player[uid].socket_id = socket.id;
        socket.emit("resource update", {name: player_name,data: manager.playerData(player_name)});
        
    });

    socket.on('add', function(data) {
        if (users_player[uid] === undefined) {    
            socket.emit('route', 'home');
            return;
        }
        var player = users_player[uid].name;
        if (users_player[data.from] === undefined) {    
            socket.emit('route', 'home');
            return;
        }
        console.log(data);
        if (data.mes === 'all') {
            if (!manager.addResource(player, 'ore', 10000)) {
                socket.emit('route', 'home');
                return;
            }
            
            if (!manager.addResource(player, 'sheep', 10000)) {
                socket.emit('route', 'home');
                return;
            }
            
            if (!manager.addResource(player, "lumber", 10000)) {
                socket.emit('route', 'home');
                return;
            }
            
            if (!manager.addResource(player, "brick", 10000)) {
                socket.emit('route', 'home');
                return;
            }
            if (!manager.addResource(player, "grain", 10000)) {
                socket.emit('route', 'home');
                return;
            }
        } else {
            var d = data.mes.split(' ');
            if (d[0] !== 'overide') {
                if (socket.id !== player_users[data.to].id) return;
                if (d[0] === 'vp') {
                    manager.addDevResource(data.to, 'victory point', 1);
                    var message = {
                        type: 'information',
                        pre: player + " received a victory point for ",
                        mes: 'a hairy pussy'
                    }
                    if (d[1] !== undefined || d[1].length <= 1) {
                        message.mes = '';
                        for (var i = 1; i < d.length; i++) {
                            message.mes += d[i] + ' ';
                        }
                    }
                    socket.emit('message', message);
                    socket.broadcast.emit('message', message2);
                } else {
                    if (!manager.addResource(player, d[0], parseInt(d[1]))) {
                        socket.emit('route', 'home');
                        return;
                    }
                    var message = {
                        type: 'resource',
                        pre: player + " received ",
                        mes: parseInt(d[1]) + " " + d[0]
                    }
                    var message2 = {
                        type: 'message',
                        pre: player + " received ",
                        mes: parseInt(d[1]) + " " + d[0]
                    }
                    socket.emit('message', message);
                    socket.broadcast.emit('message', message2);
                }
            } else {
                
                if (!manager.addResource(data.to, d[1], parseInt(d[2]))) {
                    socket.emit('route', 'home');
                    return;
                }
                socket.emit('message', {type:'message', pre: '', mes: '/add ' + data.to + ' ' + d[2] + ' ' + d[1]})

            }
        }


        socket.emit("resource update", {name: player,data: manager.playerData(player)});
        
       
    })

    socket.on('update', function(userid) {
        socket.emit("resource update", {name: users_player[userid].name,data: manager.playerData(users_player[userid].name)});
    })


    socket.on('all', function(data) {
        if (users_player[data.from] === undefined) {    
            socket.emit('route', 'home');
            return;
        }
        var mes = {
            type: 'message',
            pre: "",
            mes: data.mes
        }
        socket.broadcast.emit('message', mes);
        socket.emit('message', mes);
    });

    socket.on('help', function(data) {
        if (users_player[data.from] === undefined) {    
            socket.emit('route', 'home');
            return;
        }
        socket.emit('message', {type: 'message', pre: "",
         mes: '/w [player name] [message]      whisper to a player'});
        
        socket.emit('message', {type: 'message', pre: "",
         mes: '/s [player name]                 steal from a player'});
        socket.emit('message', {type: 'message', pre: "",
         mes: '/t [player name]                 trade with a player'});
        socket.emit('message', {type: 'message', pre: "",
         mes: '/add [resource] [value]                manually add resources (vp for victory point)'});
        socket.emit('message', {type: 'message', pre: "",
         mes: '/r [message]                manually add resources'});
            
    });

    socket.on('s', function(data) {
        if (users_player[data.from] === undefined) {    
            socket.emit('route', 'home');
            return;
        }

        if (data.mes.length > 0) {
            
            var stealer;
            var stolen_from = users_player[uid].name;
            var stealer = data.to;
            for (var e in events[stolen_from]) {
                var event = events[stolen_from][e].split(' ');
                if (event[0] === 'is_stealing' && event[1] === stealer) {
                    if (data.mes === 'dne') {
                        socket.emit('err', 'wrong input');
                        return;
                    }
                    events[stolen_from].splice(e, 1);
                    for (var del in  events[stealer]) {
                        if (events[stealer][del] === 'stealing_from ' + stolen_from) {
                            events[stealer].splice(del, 1);
                        }
                    }
                    if (data.mes === 'no') {
                        player_users[stealer].emit("err", "user declined");
                        return;
                    }
                    break;
                }
                
            }
            if (stealer === undefined || stolen_from === undefined) {
                socket.emit("err", "stealing undefined");
                return;
            }
            if (manager.resourceNum(stolen_from) <= 0) {
                socket.emit("err", "you have no resources");
                player_users[stealer].emit("err", "user has no resources");
                return;
            }
            var resource = manager.steal(stolen_from, stealer);
            if (resource === undefined) {
                socket.emit("err", "stealing error");
                return;
            }
            manager.addResource(stolen_from, resource, -1);
            manager.addResource(stealer, resource, 1);
            var message = {
                type: 'stealing',
                pre: stealer + " ",
                mes: "has stolen " + resource + " from " + stolen_from
            };
            socket.emit("message", message);
            socket.broadcast.emit("message", message);
            player_users[stealer].emit("resource update", {name: stealer,data: manager.playerData(stealer)});
            socket.emit("resource update", {name: stolen_from,data: manager.playerData(stolen_from)});
            
        } else {
            if (data.to.length <= 0) {
                socket.emit("err", "invalid name input");
                return;
            }
            var to = data.to;
            if (player_users[to] === undefined) {
                //handle whisper error
                socket.emit("err", "name undefined");
                return;
            }
            events[users_player[uid].name].push('stealing_from ' + to);
            events[to].push('is_stealing ' + users_player[uid].name);
            console.log(events);
            console.log("steal check: " + users_player[uid].name);
            var out = {
                type: 'stealing',
                pre: users_player[uid].name + " ",
                mes: 'is trying to steal from you (/s [name] yes/no)'
            };
            player_users[to].emit('message', out);
        }
        
    })

    socket.on('reset', function(data) {
        if (data.to !== 'game') {
            socket.emit("err", 'no');
        }
        socket.emit('message', {type: 'message', pre: '',
            mes: 'restarting in 5. exit now to change name'});
        socket.broadcast.emit('message', {type: 'message', pre: '',
            mes: 'restarting in 5. exit now to change name'});
        var i = 4;
        setInterval(function(){
            
            socket.emit('message', {type: 'message', pre: i,
                mes: '...'});
            socket.broadcast.emit('message', {type: 'message', pre: i,
            mes: '...'});
            if (--i <= 0) {
                manager.reset();
                
                for (var name in player_users) {
                    player_users[name].emit("route", 'home');
                }
                clearInterval(this);
                
            }
            
        }, 1000);
        
    })

    socket.on('players', function(data){
        for (name in player_users) {
            socket.emit('message', {type: 'information', pre: name + " has ",
                mes: manager.resourceNum(name) + ' resources'    
            });
        }
    });  

    socket.on('w', function(data) {
        if (users_player[data.from] === undefined) {    
            socket.emit('route', 'home');
            return;
        }
        if (data.to <= 0) {
            //handle input error
            socket.emit("err", "invalid name");
            return;
        }
        var to = data.to;
        if (player_users[to] === undefined) {
            //handle whisper error
            socket.emit("err", "invalid name");
            return;
        }
        console.log("whisper check: " + users_player[uid].name);
        var out = {
            type: 'whisper',
            pre: users_player[uid].name + ": ",
            mes: data.mes
        };
        socket.emit('message', out)
        
        out = {
            type: 'whisper',
            pre: users_player[uid].name + ": ",
            mes: data.mes,
            metadata: users_player[uid].name
        };
        player_users[to].emit('message', out);
    });

    socket.on('r', function(data) {
        //socket.broadcast.emit('message', data);
    });

    socket.on('t', function(data) {
        socket.emit('err', 'not set up yet')
        if (true) {
            return;
        }
        console.log(data);
        var to_pos = data.mes.indexOf(' ');
        if (to_pos < 0) to_pos = data.mes.length;
        var to = data.mes.substring(0, to_pos);
        if (player_users[to] === undefined) {
            //handle whisper error
            socket.emit("err", "invalid name");
            return;
        }
        var out = {
            type: 'trade',
            pre: "you  ",
            mes: "asked to trade with " + to
        };
        socket.emit('message', out);
        socket.emit('setInformation', {key: 'name', value: to})

        out = {
            type: 'trade',
            pre: users_player[uid].name + " ",
            mes: "wants to trade. (Yes/No)"
        };
        player_users[to].emit('message', out);
    });
    socket.on('t1', function(data) {
        if (uid === null) {
            socket.emit('route', 'home');
            return;
        }
        // console.log(data);
        // var to_pos = data.mes.indexOf(' ');
        // if (to_pos < 0) to_pos = data.mes.length;
        var yea = data.mes.substring(1, data.mes.length);
        if (yea === "yes") {

        } else if (yea === 'no') {

        } else {
            socket.emit("err", "invalid input for trade");
        }
        // if (player_users[to] === undefined) {
        //     //handle whisper error
        //     socket.emit("err", "invalid name");
        //     return;
        // }

        var out = {
            type: 'trade',
            pre: "you  ",
            mes: "declined"
        };
        socket.emit('message', out);

        out = {
            type: 'trade',
            pre: users_player[uid].name + " ",
            mes: "sdaf"
        };
        player_users[to].emit('message', out);
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
            mes: value + " " + data.r_name
        }
        var message2 = {
            type: 'message',
            pre: data.player + " received ",
            mes: value + " " + data.r_name
        }
        socket.emit('message', message);
        socket.broadcast.emit('message', message2);
        ///player_users[data.player].emit("resource update", manager.playerData(data.player));
    });

    socket.on('echo', function(data) {
        socket.emit('message', {
            type: 'message',
            pre: 'me: ',
            mes: data
        });
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
        var player = users_player[uid].name;
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
            pre: player + " received ",
            mes: "-1 ore, -1 sheep, -1 grain"
        }
        socket.emit('message', message);
        socket.broadcast.emit('message', {type: 'purchase', pre: users_player[uid].name + ' ', mes: 'purchased a dev card'});
        socket.emit('message', {type: 'purchase', pre: users_player[uid].name + ' ', mes: 'purchased a dev card'});
        //player_users[player].emit("resource update", manager.playerData(player));
    })

    socket.on('buy road', function(data) {
        
        if (!manager.buyRoad(data)) {
            socket.emit('err', 'Couldn\'t purchase road');
            return;
        }
        var player = users_player[uid].name;
        var message = {
            type: "purchase",
            pre: "received: ",
            mes: "road"
        }
        socket.emit('message', message);
        
        var message2 = {
            type: "message",
            pre: data + " received a ",
            mes: "road"
        }
        socket.broadcast.emit('message', message2);
        message = {
            type: 'resource',
            pre: player + " received ",
            mes: "-1 lumber, -1 brick"
        }
        socket.emit('message', message);
       // player_users[player].emit("resource update", manager.playerData(player));
    })

    socket.on('buy settlement', function(data) {
        
        if (!manager.buySettlement(data)) {
            socket.emit('err', 'Couldn\'t purchase settlement');
            return;
        }
        var player = users_player[uid].name;
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
            pre: data + " received a ",
            mes: "settlement"
        }
        socket.broadcast.emit('message', message2);
        message = {
            type: 'resource',
            pre: player + " received ",
            mes: "-1 lumber, -1 sheep, -1 grain, -1 brick"
        }
        socket.emit('message', message);
    })

    socket.on('buy city', function(data) {
        if ( users_player[uid] === undefined) {
            socket.emit('route', 'home');
            return;
        }
        manager.printGame();
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
            type: "message",
            pre: data + " received a ",
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
        var player = users_player[uid].name;
        message = {
            type: 'resource',
            pre: player + " received ",
            mes: "-3 ore, -2 grain"
        }
        socket.emit('message', message);
        //player_users[player].emit("resource update", manager.playerData(player));
    })
});

