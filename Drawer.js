var Drawer = function(io) {
  this.io = io;
}

Drawer.prototype.draw = function(appPos, erasePos, color) {
  this.io.sockets.emit('redraw', {"erase": erasePos, "append": appPos, "color": color});
}

module.exports.Drawer = Drawer;

