var Utility = require('./Utility').Utility;
var Command = require('./Command');
var Snake = require('./Snake');
const snakeStat = require('./SnakeStatus').SnakeStatus;
const constantSet = require('./ConstantSet').ConstantSet;
const bodyChanType = require('./BodyChangeType').BodyChangeType;
var choicePriority = {
	firstQuadrant:[[0,1],[-1,0],[1,0],[0,-1]],// preyRow<=airow&&precol>aicol
	secondQuadrant:[[-1,0],[0,-1],[1,0],[0,1]],//preyRow<airow&&preycol<=aicol
	thirdQuadrant:[[0,-1],[1,0],[0,1],[-1,0]],//preyRow>=airow&&preycol<aicol
	fourthQuadrant:[[1,0],[0,1],[-1,0],[0,-1]]//preyRow>airow&&preycol>aicol
}

var AIsnake = function(name, body, color, walkRoundNum, trackNum){
	this.snake = new Snake(name, body, color);
	this.prefSnakeName = constantSet.NONE;
	this.trackNum = 0;
	this.walkRoundNum = 0;
	this.WALK_ROUND_NUM = walkRoundNum;
	this.TRACK_NUM = trackNum;
}

AIsnake.prototype.walkWithSuggestPriority = function(boardManager, priority){
  var head = Utility.getFirstElement(this.snake.body);
  for (var i = 0;i <= priority.length;i++){
  	var pos = {};
  	if (i != priority.length) {
      pos = {"row": head.row + priority[i][0], 
		     "col":head.col + priority[i][1]};
  	}

	if (i == priority.length){
	  this.snake.status = snakeStat.DIE;
	} else if (boardManager.canMove(pos) && !boardManager.canEat(pos)){
	  this.snake.changeBody(pos, bodyChanType.MOVE, boardManager);
	  break;
	}
  }
}

AIsnake.prototype.getPrefSnakeName = function() {
  return this.prefSnakeName;
}

AIsnake.prototype.walkWithoutTarget = function(boardManager, commands) {
  var start = Utility.getRandomInt(0, commands.length - 1);
  var next = start;
  while (true) {
    var nextPos = this.snake.getNextPos(commands[next]);
    if (boardManager.canMove(nextPos) && !boardManager.canEat(nextPos)) {
	  this.snake.changeBody(nextPos, bodyChanType.MOVE, boardManager);
	  break;
    } else if ((next + 1) % commands.length == start) {
      this.snake.status = snakeStat.DIE;
      break;
    }
    next = (next + 1) % commands.length;
  }
}

AIsnake.prototype.trackWithTarget = function(boardManager, csSnake){
  var aiHead = Utility.getFirstElement(this.snake.body);
  var prefHead = Utility.getFirstElement(csSnake.snake.body);
			/*select the priority try sequence*/
  if (prefHead.row <= aiHead.row && prefHead.col > aiHead.col) {
	priority = choicePriority.firstQuadrant;
  }
  else if (prefHead.row < aiHead.row && prefHead.col <= aiHead.col) {
	priority = choicePriority.secondQuadrant;
  }
  else if (prefHead.row >= aiHead.row && prefHead.col < aiHead.col) {
	priority = choicePriority.thirdQuadrant;
  }
  else {
	priority = choicePriority.fourthQuadrant;
  }
  this.walkWithSuggestPriority(boardManager, priority);
}

AIsnake.prototype.getStatus = function() {
  return this.snake.status;
}

AIsnake.prototype.nextAction = function(boardManager, avaSnakeName, csSnakePool) {
  commands = Command.getAllCommand();
  if (this.prefSnakeName == constantSet.NONE) {
	if (this.walkRoundNum < this.WALK_ROUND_NUM) {
	  this.walkWithoutTarget(boardManager, commands);
	  this.walkRoundNum++;
	} 
	else {
	  this.prefSnakeName = Utility.getRandomElement(avaSnakeName);
	  if (this.prefSnakeName != constantSet.NONE) {
	  	Utility.deleteElement(avaSnakeName, this.prefSnakeName);
	  }
	  if (this.prefSnakeName != constantSet.NONE && csSnakePool.hasOwnProperty(this.prefSnakeName)) {
	    this.trackWithTarget(boardManager, csSnakePool[this.prefSnakeName]);
	    this.trackNum++;
	  } 
	  else{
	  	this.prefSnakeName = constantSet.NONE;
		this.walkWithoutTarget(boardManager, commands);
		if (this.walkRoundNum < this.WALK_ROUND_NUM) {
		  this.walkRoundNum++;
		}
	  } 
	}
  }
  else{
	if (csSnakePool.hasOwnProperty(this.prefSnakeName)) {
	  this.trackNum++;
	  this.trackWithTarget(boardManager, csSnakePool[this.prefSnakeName]);
	} else {
	  this.prefSnakeName = constantSet.NONE;
	  this.walkRoundNum = 0;
	}

	if (this.trackNum > this.TRACK_NUM) {
	  this.trackNum = 0;
	  if (csSnakePool.hasOwnProperty(this.prefSnakeName)) {
		avaSnakeName.push(this.prefSnakeName);
	  }
	  this.walkRoundNum = 0;
	  this.prefSnakeName = constantSet.NONE;
	}
  }
}

module.exports.AIsnake = AIsnake;