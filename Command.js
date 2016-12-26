var commands = ['down', 'up', 'left', 'right'];
var Command = function() {
  this.DOWN = commands[0];
  this.UP = commands[1];
  this.LEFT = commands[2];
  this.RIGHT = commands[3];
  this.commands = commands;
  this.getAllCommand = getAllCommand;
}

function getAllCommand() {
  return this.commands;
}

Command.prototype.isConflict = function(direction1, direction2) {
  return (direction1 == this.DOWN && direction2 == this.UP
             || direction1 == this.UP && direction2 == this.DOWN
             || direction1 == this.RIGHT && direction2 == this.LEFT
             || direction1 == this.LEFT && direction2 == this.RIGHT);
}
module.exports = new Command();