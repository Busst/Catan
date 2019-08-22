
var socket = io();

var text_box = document.getElementById("text_box");
var command_line = document.getElementById('command_line');

command_line.addEventListener("keydown", keyDownHandler, false);
command_line.addEventListener("keyup", keyUpHandler, false);

var keyDown = false;
function keyDownHandler(event) {
    var keyPressed = event.keyCode;
    if (!keyDown && keyPressed === 13) {
        var line = command_line.value;
        var list = document.getElementById('chat_list');
        var span = document.createElement('li');
        span.textContent = line;
        span.setAttribute('margin', "0");
        span.setAttribute('padding', "0");
        list.appendChild(span);
        command_line.value = "";
        keyDown = true;
        sendToServer(message);
    }
}

function keyUpHandler(event) {
    if (keyDown) {
        keyDown = false;
    }
}

function sendToServer(message) {

}

