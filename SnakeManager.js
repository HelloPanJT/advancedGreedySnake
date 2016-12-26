var AISnake = require('./AISnake').AIsnake;
var ClientSnake = require('./ClientSnake')
var AISnakeParams = require('./AISnakeParams').AISnakeParams;
const ClientSnakeParams= require('./ClientSnakeParams').ClientSnakeParams;
const Utility = require('./Utility').Utility;
var MAX_AISNAKE = AISnakeParams.MAX_AISNAKE;

var SnakeManager = function(BoardMangager, ColorProvider) {
  self = this;
  this.BoardMangager = BoardMangager;
  this.ColorProvider = ColorProvider;
  this.clientSnakePool = {};
  this.avaSnakeName = [];
  this.AISnakePool = {};
  this.avaAIName = [];
  this.curAISnakeNum = 0;
  this.clientTick = setInterval(function() {
    self.moveClientSnake();
  }, 500);
  this.AITick = setInterval(function() {
    self.moveAISnake();
  }, 300);
  initAIName(this.avaAIName);
}

var initAIName = function(avaAIName) {
  for (var i = 0; i < MAX_AISNAKE; i++) {
    var name = 'AI' + i;
    avaAIName.push(name);
  }
}

SnakeManager.prototype.getOneName = function() {
  if (this.avaAIName.length > 0) {
    return this.avaAIName.shift();
  }
  return 'none';
}

SnakeManager.prototype.addName = function(name) {
  this.avaAIName.push(name);
}

SnakeManager.prototype.addSnake = function(type, name) {
  if (this.alreadyExist(type, name)) {
  	return false;
  }

  var color = this.ColorProvider.provideOneColor();
  if (this.curAISnakeNum < MAX_AISNAKE) {
    var aiName = this.getOneName();
    var body = this.BoardMangager.getUnusedPlace(AISnakeParams.initLen, color);
    this.AISnakePool[aiName] = new AISnake(aiName, body, color, 
                                             AISnakeParams.WALK_ROUND_NUM, 
                                             AISnakeParams.TRACK_NUM);
    this.curAISnakeNum++;
  }
  var body = this.BoardMangager.getUnusedPlace(ClientSnakeParams.initLen, color);
  this.clientSnakePool[name] = new ClientSnake(name, body, color);
  this.avaSnakeName.push(name);
}

SnakeManager.prototype.killSnake = function(type, name) {
  if (type == 'AISnake' && this.AISnakePool.hasOwnProperty(name)) {
  	var body = this.AISnakePool[name].snake.body;
  	this.BoardMangager.removeBody(body, 'snake');
    delete this.AISnakePool[name];
    this.curAISnakeNum--;
    this.addName(name);
  } else if (type == 'clientSnake' && this.clientSnakePool.hasOwnProperty(name)){
  	var body = this.clientSnakePool[name].snake.body;
  	this.BoardMangager.removeBody(body, 'snake');
  	delete this.clientSnakePool[name];
  }
}

SnakeManager.prototype.alreadyExist = function(type, name) {
  if (type == 'AISnake') {
  	return this.AISnakePool.hasOwnProperty(name);
  } else {
  	return this.clientSnakePool.hasOwnProperty(name);
  }
}

SnakeManager.prototype.changeDir = function(name, dir) {
  var clientSake = this.clientSnakePool[name];
  if (clientSake) {
    clientSake.changeDir(dir);
  }
}

SnakeManager.prototype.moveClientSnake = function() {
  for (var key in this.clientSnakePool) {
    this.clientSnakePool[key].move(this.BoardMangager);
    if (this.clientSnakePool[key].getStatus() != 'alive') {
      this.killSnake('clientSnake', key);
      Utility.deleteElement(this.avaSnakeName, key);
    }
  }
}

SnakeManager.prototype.sendCurrentData = function() {
  var drawer = this.BoardMangager.getDrawer();
  drawPool(this.clientSnakePool, drawer);
  drawPool(this.AISnakePool, drawer);
}

function drawPool(pool, drawer) {
  for (var key in pool) {
    var snake = pool[key].snake;
    var data = Utility.bodyToNumArray(snake.body);
    drawer.draw(data, [], snake.color);
  }
}

SnakeManager.prototype.moveAISnake = function() {
  for (var key in this.AISnakePool) {
    this.AISnakePool[key].nextAction(this.BoardMangager, this.avaSnakeName, this.clientSnakePool);
    if (this.AISnakePool[key].getStatus() != 'alive') {
      this.killSnake('AISnake', key);
    }
  }
}

module.exports = SnakeManager;