var AISnake = require('./AISnake').AIsnake;
var ClientSnake = require('./ClientSnake')
var AISnakeParams = require('./AISnakeParams').AISnakeParams;
const ClientSnakeParams= require('./ClientSnakeParams').ClientSnakeParams;
const Utility = require('./Utility').Utility;
const MAX_AISNAKE = AISnakeParams.MAX_AISNAKE;
const MAX_CLIENT_LIMIT = ClientSnakeParams.MAX_CLIENTNUM;
const snakeType = require('./SnakeType');
const snakeStat = require('./SnakeStatus').SnakeStatus;
const gridType = require('./GridType').GridType;
const bodyChanType = require('./BodyChangeType').BodyChangeType;
const constantSet = require('./ConstantSet').ConstantSet;
var SnakeManager = function(BoardMangager, ColorProvider) {
  var self = this;
  this.BoardMangager = BoardMangager;
  this.ColorProvider = ColorProvider;
  this.clientSnakePool = {};
  this.avaSnakeName = [];
  this.AISnakePool = {};
  this.avaAIName = [];
  this.curAISnakeNum = 0;
  this.curCliSnakeNum = 0;
  this.clientTick = setInterval(function() {
    self.moveClientSnake();
  }, 300);
  this.AITick = setInterval(function() {
    self.moveAISnake();
  }, 320);
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
  	return 'nameDup';
  }

  var color = this.ColorProvider.provideOneColor();

  if (this.curAISnakeNum < MAX_AISNAKE) {
    var aiName = this.getOneName();
    var body = this.BoardMangager.getUnusedPlace(AISnakeParams.INITLEN, AISnakeParams.COLOR);
    this.AISnakePool[aiName] = new AISnake(aiName, body, AISnakeParams.COLOR, 
                                             AISnakeParams.WALK_ROUND_NUM, 
                                             AISnakeParams.TRACK_NUM);
    this.curAISnakeNum++;
  }
  var body = [];
  if (this.curCliSnakeNum < MAX_CLIENT_LIMIT) {
    body = this.BoardMangager.getUnusedPlace(ClientSnakeParams.INITLEN, color);
  } 
  if (body.length != 0) {
   
    this.clientSnakePool[name] = new ClientSnake(name, body, color);
    this.avaSnakeName.push(name);
    this.provideInfo(bodyChanType.ADD);
    this.curCliSnakeNum++;
    return 'success';
  } else {
    return 'crowded';
  }
}

SnakeManager.prototype.deleteAvaName = function(name) {
  Utility.deleteElement(this.avaSnakeName, name);
}

SnakeManager.prototype.addAvaName = function(name) {
  this.avaSnakeName.push(name);
}

SnakeManager.prototype.provideInfo = function(type) {
  var data = packSnakeInfo(this.clientSnakePool);
  this.BoardMangager.sendInfo(type, data);
}

SnakeManager.prototype.eraseClientInfo = function(name) {
  this.BoardMangager.sendInfo(snakeStat.DIE, name);
}

var packSnakeInfo = function(snakePool) {
  var data = [];
  for (var key in snakePool) {
    var snake = snakePool[key].snake;
    var info = {length: snake.body.length, color: snake.color, name: snake.name};
    data.push(info);
  }
  return data;
}

SnakeManager.prototype.killSnake = function(type, name) {
  if (type == snakeType.AI && this.AISnakePool.hasOwnProperty(name)) {
    var aiSnake = this.AISnakePool[name];
  	var body = aiSnake.snake.body;
    var prefName = aiSnake.getPrefSnakeName();
  	this.BoardMangager.removeBody(body, gridType.SNAKE);
    delete this.AISnakePool[name];
    this.curAISnakeNum--;
    this.addName(name);
    if (prefName != constantSet.NONE && this.clientSnakePool.hasOwnProperty(prefName)) {
      this.addAvaName(prefName);
    }
  } else if (type == snakeType.CLIENT && this.clientSnakePool.hasOwnProperty(name)){
  	var body = this.clientSnakePool[name].snake.body;
    var color = this.clientSnakePool[name].snake.color;
  	this.BoardMangager.removeBody(body, gridType.SNAKE);
  	delete this.clientSnakePool[name];
    this.ColorProvider.addOneColor(color);
    this.eraseClientInfo(name);
    this.deleteAvaName(name);
    this.provideInfo(bodyChanType.KILL);
    this.curCliSnakeNum--;
  }
}

SnakeManager.prototype.alreadyExist = function(type, name) {
  if (type == snakeType.AI) {
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
  var shouldUpdate = false;
  for (var key in this.clientSnakePool) {
    var action = this.clientSnakePool[key].move(this.BoardMangager);
    if (this.clientSnakePool[key].getStatus() != snakeStat.ALIVE) {
      this.killSnake(snakeType.CLIENT, key);
      Utility.deleteElement(this.avaSnakeName, key);
    }
    if (action == bodyChanType.EAT) {
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) {
    this.provideInfo(action);
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
    if (this.AISnakePool[key].getStatus() != snakeStat.ALIVE) {
      this.killSnake(snakeType.AI, key);
    }
  }
}

module.exports = SnakeManager;