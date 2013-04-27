var Leap = require('leapjs').Leap
var app = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io'),
    io = io.listen(server);

server.listen(8880);

var controllerOptions = {enableGestures: true};

Leap.loop(controllerOptions, function(frame) {
    if (frame.gestures.length) {
        var gesture = frame.gestures[0];
        if(gesture.state == 'start') {
            switch(gesture) {
                case 'swipe': {
                    socket.emit('swipe', { direction: gesture.direction });
                    break;
                }
                case 'tap': {
                    socket.emit('tap');
                    break;
                }
            }
        }
    } else {
        if (frame.hands.length) {
            console.log('finger '+frame.hands[0].direction);
        }
    }
})

/*

 io.sockets.on('connection', function (socket) {
 //  socket.emit('object-removed');
 //  socket.emit('rotate', { direction: -1 });

 socket.on('my other event', function (data) {
 console.log(data);
 });

 });
 */