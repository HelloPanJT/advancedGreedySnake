var Snake = require('./Snake');
var command = require('./Command');
const snakeStat = require('./SnakeStatus').SnakeStatus;
const bodyChanType = require('./BodyChangeType').BodyChangeType;

function ClientSnake(username, body, color) {
	this.snake = new Snake(username, body, color);
	this.direction = command.DOWN;
}

ClientSnake.prototype.eat = function(pos, boardManager) {
  this.snake.changeBody(pos, bodyChanType.EAT, boardManager);
  boardManager.generateFood();
}

ClientSnake.prototype.changeDir = function(direction) {
  if (!command.isConflict(direction, this.direction)) {
    this.direction = direction;
  }
}

ClientSnake.prototype.getStatus = function() {
  return this.snake.status;
}

ClientSnake.prototype.move = function(boardManager) {
  var nextPos = this.snake.getNextPos(this.direction);
  if (!boardManager.canMove(nextPos)) {
  	this.snake.status = snakeStat.DIE;
    return snakeStat.DIE;
  } else if (boardManager.canEat(nextPos)) {
  	this.eat(nextPos, boardManager);
    return bodyChanType.EAT;
  } else {
  	this.snake.changeBody(nextPos, bodyChanType.MOVE, boardManager);
    return bodyChanType.MOVE;
  }
}

module.exports = ClientSnake;