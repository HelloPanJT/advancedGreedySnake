var Snake = require('./Snake');
var command = require('./Command');

function ClientSnake(username, body, color) {
	this.snake = new Snake(username, body, color);
	this.startTime = "";
	this.endTime = "";
	this.direction = command.DOWN;
}

ClientSnake.prototype.eat = function(pos, BoardManager) {
  this.snake.changeBody(pos, 'eat', BoardManager);
  BoardManager.generateFood();
}

ClientSnake.prototype.changeDir = function(direction) {
  if (!command.isConflict(direction, this.direction)) {
    this.direction = direction;
  }
}

ClientSnake.prototype.getStatus = function() {
  return this.snake.status;
}

ClientSnake.prototype.move = function(BoardManager) {
  var nextPos = this.snake.getNextPos(this.direction);
  if (!BoardManager.canMove(nextPos)) {
  	this.snake.status = 'die';
    return 'die';
  } else if (BoardManager.canEat(nextPos)) {
  	this.eat(nextPos, BoardManager);
    return 'eat';
  } else {
  	this.snake.changeBody(nextPos, 'move', BoardManager);
    return 'move';
  }
}

module.exports = ClientSnake;