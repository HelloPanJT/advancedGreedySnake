var drawer = require('./Drawer').Drawer;
var UtilityInst = require('./Utility').Utility;
var boardParams = require('./BoardParams').boardParams;
var BoardManager = function(io) {
  this.snakeGrids = new Set(); 
  this.foodGrids = new Set();
  this.BoardParams = boardParams;
  this.drawer = new drawer(io);
  this.canMove = canMove;
}

var canMove = function(pos) {
  var num = UtilityInst.RC2Num(pos);
  if (pos.row < 0
  	      || pos.row >= this.BoardParams.height
  	      || pos.col < 0
  	      || pos.col >= this.BoardParams.width
  	      || this.snakeGrids.has(num)) {
  	return false;
  }
  return true;
}

BoardManager.prototype.sendCurrentData = function() {
  var foodData = UtilityInst.setToArray(this.foodGrids);
  this.drawer.draw(foodData, [], 'GOLD');
}

BoardManager.prototype.getDrawer = function() {
  return this.drawer;
}

function logSetElements(value1, value2, set) {
  console.log("s[" + value1 + "] = " + value2);
}

BoardManager.prototype.showSet = function(set) {
  set.forEach(logSetElements);
}

BoardManager.prototype.remove = function(pos, type) {
  this.removePos(pos, type);
}

BoardManager.prototype.removeBody = function(body, type) {
  while (body.length != 0) {
  	this.remove(body.pop(), type);
  }
}

BoardManager.prototype.removePos = function(pos, type) {
  var num = UtilityInst.RC2Num(pos);
  var data = UtilityInst.eleToArray(num);
  if (type == 'snake') {
  	this.snakeGrids.delete(num);
  } else {
  	this.foodGrids.delete(num);
  }
  this.drawer.draw([], data, 'BLACK');
}



BoardManager.prototype.add = function(pos, type, color) {
  if (type == 'snake') {
    this.addPos(pos, this.snakeGrids, color);
  } else {
  	this.addPos(pos, this.foodGrids, color);
  }
}

BoardManager.prototype.addPos = function(pos, set, color) {
  var num = UtilityInst.RC2Num(pos);
  set.add(num);
  var addPos = UtilityInst.eleToArray(num);
  this.drawer.draw(addPos, [], color);
}

BoardManager.prototype.canEat = function(pos) {
  var num = UtilityInst.RC2Num(pos);
  return this.foodGrids.has(num);
}

BoardManager.prototype.getUnusedPlace = function(len, color) {
  while (true) {
	  var pos = UtilityInst.getRandomInt(0, this.BoardParams.width * this.BoardParams.height - 1);
	  var posXY = UtilityInst.num2RC(pos);
	  var body = [];
	  var i = 5; //5 ununsed grid before the head
	  while (i > -len) {
	    body.push({"row": posXY.row, "col": posXY.col + i})
	    i--;
	  }
    var self = this;
	  if (body.every(function(ele) {return (self.canMove(ele) && !self.foodGrids.has(UtilityInst.RC2Num(ele)))})) {
      body = body.slice(5, body.length).reverse();
	    var numBody = [];
	    body.forEach(function(ele) {
	  	  var num = UtilityInst.RC2Num(ele);
	  	  numBody.push(num);
	  	  self.snakeGrids.add(num);
	    });
	    this.drawer.draw(numBody, [], color);
	    return body;
	  }
  }
}

BoardManager.prototype.generateFood = function() {
  var foods = [];
  if (this.foodGrids.size < this.BoardParams.MAX_FOOD_NUMBER) {
	  var gridSize = this.foodGrids.size;
	  for (var i = 0; i < (this.BoardParams.MAX_FOOD_NUMBER - gridSize); i++) {
	    while (true) {
	      var pos = UtilityInst.getRandomInt(0, this.BoardParams.width * this.BoardParams.height - 1);
	      if (!this.foodGrids.has(pos) && !this.snakeGrids.has(pos)) {
          var posxy = UtilityInst.num2RC(pos);
		      this.add(posxy, 'food', 'GOLD');
		      break;
	      }
	    }
    }
  }
}

module.exports.BoardManager = BoardManager;