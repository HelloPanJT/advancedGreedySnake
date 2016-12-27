var Messager = function(io) {
  this.io = io;
}

Messager.prototype.sendMessage = function(message) {
  this.io.sockets.emit('message', message);
}

module.exports.Messager = Messager;