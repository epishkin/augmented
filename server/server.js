var Leap = require('leapjs').Leap,
    app = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io'),
    io = io.listen(server);

server.listen(8880);

var socket = null;
io.sockets.on('connection', function (connection) {
  socket = connection;
});

var controllerOptions = {enableGestures: true};
Leap.loop(controllerOptions, function(frame) {
    if (!socket) {
        console.log('no socket on leap event');
        return;
    }

    if (frame.gestures.length) {
        var gesture = frame.gestures[0];
        if(gesture.state == 'start') {
            switch(gesture.type) {
                case 'swipe': {
                    console.log('swipe');
                    socket.emit('swipe', gesture.direction);
                    break;
                }
                case 'tap': {
                    console.log('tap');
                    socket.emit('tap');
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