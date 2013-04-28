var Leap = require('leapjs').Leap,
    app = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io'),
    io = io.listen(server);

io.set('log level', 1);
server.listen(8880);

var socket = null;
io.sockets.on('connection', function (connection) {
  console.log('client connected');
  socket = connection;
});

var controllerOptions = {enableGestures: true};
Leap.loop(controllerOptions, function(frame) {
    if (!socket) {
        return;
    }

    if (frame.gestures.length) {
        var gesture = frame.gestures[0];
        if(gesture.state == 'start') {
            switch(gesture.type) {
                case 'circle': {
                    console.log('circle');
                    socket.emit('circle');
                    break;
                }
            }
        }
    } else {
        if (frame.pointables.length) {
            var finger = frame.pointables[0];
            socket.emit('finger', finger.tipPosition);
        }
    }
});