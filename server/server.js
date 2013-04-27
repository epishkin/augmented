var app = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io'),
    io = io.listen(server);

server.listen(8880);

io.sockets.on('connection', function (socket) {
  socket.emit('object-added', { type: 'big-mac' });
//  socket.emit('object-removed');
//  socket.emit('rotate', { direction: -1 });
/*
  socket.on('my other event', function (data) {
    console.log(data);
  });
*/
});
