const snakeStat = require('./SnakeStatus').SnakeStatus;
const bodyChanType = require('./BodyChangeType').BodyChangeType;
var Drawer = function(io) {
  this.io = io;
}

Drawer.prototype.draw = function(appPos, erasePos, color) {
  this.io.sockets.emit('redraw', {"erase": erasePos, "append": appPos, "color": color});
}

Drawer.prototype.drawInfo = function(type, data) {
  if (type == snakeStat.DIE) {
  	this.io.sockets.emit('clearstatus', data);
  } else if (type == bodyChanType.EAT 
  	         || type == bodyChanType.ADD 
  	         || type == bodyChanType.KILL) {
  	this.io.sockets.emit('redrawLeaderBorder', data);
  }
}
module.exports.Drawer = Drawer;

