
var socket = io();

var text_box = document.getElementById("text_box");
var command_line = document.getElementById('command_line');

command_line.addEventListener("keydown", keyDownHandler, false);
command_line.addEventListener("keyup", keyUpHandler, false);

var name = document.cookie;
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

socket.on("message", function(data) {
    var list = document.getElementById('chat_list');
    var span = document.createElement('li');
    span.textContent = data;
    var mode = data.substring(0, 1);
    if (mode === "w") {
        span.setAttribute("color: purple");
    }
    span.setAttribute('margin', "0");
    span.setAttribute('padding', "0");
    list.appendChild(span);
});

