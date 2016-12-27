var Snake = require('./Snake');
var command = require('./Command');
const snakeStat = require('./SnakeStatus').SnakeStatus;
const bodyChanType = require('./BodyChangeType').BodyChangeType;

function ClientSnake(username, body, color) {
	this.snake = new Snake(username, body, color);
	this.direction = command.DOWN;
}

ClientSnake.prototype.eat = function(pos, BoardManager) {
  this.snake.changeBody(pos, bodyChanType.EAT, BoardManager);
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
  	this.snake.status = snakeStat.DIE;
    return snakeStat.DIE;
  } else if (BoardManager.canEat(nextPos)) {
  	this.eat(nextPos, BoardManager);
    return bodyChanType.EAT;
  } else {
  	this.snake.changeBody(nextPos, 'move', BoardManager);
    return bodyChanType.MOVE;
  }
}

module.exports = ClientSnake;