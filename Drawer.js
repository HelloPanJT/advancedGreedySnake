var Drawer = function(io) {
  this.io = io;
}

Drawer.prototype.draw = function(appPos, erasePos, color) {
  this.io.sockets.emit('redraw', {"erase": erasePos, "append": appPos, "color": color});
}

Drawer.prototype.drawInfo = function(type, data) {
  if (type == 'die') {
  	this.io.sockets.emit('clearstatus', data);
  } else if (type == 'eat' || type == 'add' || 'kill') {
  	this.io.sockets.emit('redrawLeaderBorder', data);
  }
}
module.exports.Drawer = Drawer;

