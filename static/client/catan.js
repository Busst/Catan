var socket = io();

var text_box = document.getElementById("text_box");
var command_line = document.getElementById('command_line');

command_line.addEventListener("keydown", keyDownHandler, false);
command_line.addEventListener("keyup", keyUpHandler, false);
socket.emit("userGameLogin", localStorage.getItem('uUID'));

var keyDown = false;
function keyDownHandler(event) {
    var keyPressed = event.keyCode;
    if (!keyDown && keyPressed === 13) {
        var line = command_line.value;
        var list = document.getElementById('chat_list');
        var span = document.createElement('li');
        span.textContent = "me: " + line;
        span.setAttribute('margin', "0");
        span.setAttribute('padding', "0");
        list.appendChild(span);
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
        if (pos < 0) {
            mes = message.substring(1, message.length);
            out = "";
        } else {
            mes = message.substring(1, pos);
            out = message.substring(pos, message.length);
        }
        socket.emit(mes, out);
    } else {
        socket.emit("all", name + ": " + message);
    }
}

socket.on('resource update', function(data) {
    for (var v in data) {
        
        var id = document.getElementById(v);
        if (id === null) {
            continue
        }
        
        if (id.tagName === 'INPUT') {
            id = document.getElementById(v).parentElement.parentElement;
        }
        
        var value = data[v];
        handleResources(id, value);
    }
})

socket.on("message", function(data) {
    var list = document.getElementById('chat_list');
    var span = document.createElement('li');
    span.textContent = data.pre + data.mes;
    
    if (data.type === "card" || data.type === "purchase") {
        handleResources(document.getElementById(data.mes), 1);
    } else if (data.type === "resource") {
        var stuff = data.mes.split(" of ");
        var div = document.getElementById(stuff[1]).parentElement.parentElement;
        
        handleResources(div, parseInt(stuff[0]));
    }
    span.setAttribute('margin', "0");
    span.setAttribute('padding', "0");
    span.setAttribute('display', "block");
    list.appendChild(span);
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
    var temp = (parseInt(num.textContent) + change);
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



