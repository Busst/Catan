


var socket = io();

var command_line = document.getElementById('command_line');

command_line.addEventListener("keydown", keyDownHandler, false);
command_line.addEventListener("keyup", keyUpHandler, false);

socket.on("hello", function(data) {
    console.log(data);
});

var keyDown = false;
function keyDownHandler(event) {
    var keyPressed = event.keyCode;
    if (!keyDown && keyPressed === 13) {
        var line = command_line.value;
        command_line.value = "";
        keyDown = true;
        socket.emit("name_addition", line);
        
    }
}

function keyUpHandler(event) {
    if (keyDown) {
        keyDown = false;
    }
}

socket.on("name good", function(data) {
    location.replace(window.location.href + 'game');
});

socket.on("name bad", function(data) {
    var span = document.createElement("span");
    span.textContent = data;
    span.id = "error";
    if (document.getElementById("error")) {
        document.body.removeChild(document.getElementById("error"));
    }
    document.body.appendChild(span);
});