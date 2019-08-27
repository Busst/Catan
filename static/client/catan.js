var socket = io();

var text_box = document.getElementById("text_box");
var command_line = document.getElementById('command_line');

command_line.addEventListener("keydown", keyDownHandler, false);
command_line.addEventListener("keyup", keyUpHandler, false);
socket.emit("userGameLogin", localStorage.getItem('uUID'));

var keyDown = false;
var trading = false;
var last_command = [];
var last_whispered = "";

function keyDownHandler(event) {
    var keyPressed = event.keyCode;
    if (!keyDown && keyPressed === 13) {
        var line = command_line.value;
        command_line.value = "";
        keyDown = true;
        sendToServer(line);
    }
}

function keyUpHandler(event) {
    if (keyDown) {
        keyDown = false;
    }
}

function sendToServer(message) {
    if (message.substring(0, 1) === '/') {
        var pos = message.search(" ");
        var mes = "";
        var out = "";
        var sending = "";
        if (pos < 0) {
            mes = message.substring(1, message.length);
            out = "";
        } else {
            mes = message.substring(1, pos);
            var sending_pos = message.indexOf(' ', pos+1);
            if (sending_pos < 0) {
                sending = message.substring(pos + 1,message.length);
                out ="";
            } else {
                sending = message.substring(pos + 1, sending_pos);
                out = message.substring(sending_pos + 1, message.length);
            }
        }
        if (mes === 'r') {
            mes = 'w';
            out = sending;
            sending = last_whispered;   
            if (sending.length <= 0) {
                return;
            }
        }
        if (mes === 'add' && sending !== name) {
            out = sending+ " " + out;
            sending = name;
        }
        
        var container = {
            type: mes,
            from: localStorage.getItem('uUID'),
            to: sending,
            mes: out,
        };
        console.log(container);
        
        
        socket.emit(mes, container);

    } else {
        socket.emit("all", {from: localStorage.getItem('uUID'),mes: name + ": " + message});
    }
}

socket.on('resource update', function(data) {
    var data = data.data;
    for (var v in data) {
        var id = document.getElementById(v);
        if (id === null) {
            continue;
        }
        
        if (id.tagName === 'INPUT') {
            id = id.parentElement.parentElement;
        }
        
        var value = data[v];
        handleResources(id, value);
    }
})

socket.on('setInformation', function(data) {
    var key = data.key;
    var value = data.value;
    localStorage.setItem(key, value);
});

socket.on("message", function(data) {
    console.log(data);
    var list = document.getElementById('chat_list');
    var span = document.createElement('li');
    span.textContent = data.pre + data.mes;
    
     if (data.type === "card" || data.type === "purchase") {
        //handleResources(document.getElementById(data.mes), 1);
        if (data.type === 'purchase') {
            span.setAttribute('class', 'purchase');
        } 
        socket.emit('update', localStorage.getItem('uUID'));
    } else if (data.type === "resource") {
        
        socket.emit('update', localStorage.getItem('uUID'));
        
        //handleResources(div, parseInt(stuff[0]));
    } else if (data.type === 'whisper') {
        if (data.metadata !== undefined) {
            last_whispered = data.metadata;
        }
        span.setAttribute('class', 'whisper');
    } else if (data.type === "trade") {
        span.setAttribute('class', 'trade');
        
    } else if (data.type === 'stealing') {
        span.setAttribute('class', 'steal');
    } else  if (data.type === 'information') {
        span.setAttribute('class', 'information');
    }
    span.setAttribute('margin', "0");
    span.setAttribute('padding', "0");
    span.setAttribute('display', "block");
    list.appendChild(span);
    var divObj = document.getElementById('text_box');
    divObj.scrollTop = divObj.scrollHeight;
});

socket.on("err", function(data) {
    doErrorThings(data);
});

function buttonResourceHandler(event){
    var div = event.closest("div");
    var input = div.childNodes[3];
    var input_name = input.id;
    var input_value = input.value;
    
    if (input_value.length <= 0) input_value = "0";
    if (event.id === "neg" && input_value !== "0") input_value = "-" + input_value;
    var data ={
        player: name,
        r_name: input_name,
        r_value: input_value
    }
    var test = input_value.match(/[a-zA-Z]/);
    if (test === null && input_value !== "0"){
        socket.emit("input", data);
    } else {
        if (input_value === "0"){
            doErrorThings("Nothing to add, forehead");
        } else {
            doErrorThings("Resource number: NaN");    
        }
        
    } 
}

function buttonHandler(event) {
    //socket.emit(event.textContent.substring(event.textContent.search(" ") + 1, event.textContent.length));
    socket.emit(event.textContent, name);
}

function handleResources(resource, change) {
    //var res = document.getElementById(resource);
    num = resource.childNodes[3];
    var temp = change;
    num.textContent = "" + temp;
}

socket.on('route', function(){
    location.replace(window.location.origin);
});

function doErrorThings(error) {
    var list = document.getElementById('chat_list');
    var span = document.createElement('li');
    span.textContent = error;
    span.setAttribute('margin', "0");
    span.setAttribute('padding', "0");
    list.appendChild(span);
}



