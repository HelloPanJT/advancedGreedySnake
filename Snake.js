var command = require('./Command');

var Snake = function(name, body, color) {
  this.name = name;
  this.body = body;
  this.length = body.length;
  this.color = color;
  this.status = 'alive';
}

Snake.prototype.showBody = function() {
  for (var i = 0; i < this.body.length; i++) {
    console.log(this.body[i]);
    console.log(this.body[i].row * 45 + this.body[i].col);
  }
}
Snake.prototype.changeBody = function(pos, type, BoardManager) {
  if (type === "move") {
    tail = this.body.pop();
    BoardManager.remove(tail, 'snake');
  } else{
    BoardManager.remove(pos, 'food');
  }
  this.body.splice(0, 0, pos);
  BoardManager.add(pos, 'snake', this.color);
}

Snake.prototype.getNextPos = function(direction) {
  var oriHead = this.body[0];
  var head = {row: oriHead.row, col: oriHead.col};
  if (direction === command.UP) {
      head.row = head.row - 1;
  } else if (direction === command.DOWN) {
      head.row = head.row + 1;
  } else if (direction === command.LEFT) {
      head.col = head.col -1;
  } else {
      head.col = head.col + 1;
  }
  return head;
}

module.exports = Snake;