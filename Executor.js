var SnakeManager = require('./SnakeManager');
var BoardManager = require('./BoardManager').BoardManager;
var ColorProvider = require('./ColorProvider');
var Initiator = require('./Initiator');
var Messager = require('./Messager').Messager;
const snakeType = require('./SnakeType').SnakeType;

const command = require('./CommandSC').CommandSC;

var Executor = function(io) {
  this.BoardManagerInst = new BoardManager(io);
  this.MessagerInst = new Messager(io);
  var ColorProviderInst = new ColorProvider();
  this.SnakeManager = new SnakeManager(this.BoardManagerInst, ColorProviderInst);
  this.initiator = new Initiator(this.SnakeManager, this.BoardManagerInst);
  this.userNameManager = require('./UserNameManager');
}

Executor.prototype.execute = function(type, name, dir) {
  if (type == command.CREATE_SNAKE) {
  	var status = this.SnakeManager.addSnake(snakeType.CLIENT, name);
  	this.BoardManagerInst.generateFood();
    return status;
  } else if (type == command.CHANGE_DIR) {
  	this.SnakeManager.changeDir(name, dir);
  } else if (type == command.GET_CURRENTDATA) {
  	this.initiator.sendCurrentData();
  } else if (type == command.CHECK_USERNAME) {
    if (!this.userNameManager.exist(name)) {
      this.userNameManager.add(name);
      return false;
    } 
    return true;
  } else if (type == command.DELETE_USERNAME) {
    this.SnakeManager.killSnake(snakeType.CLIENT, name);
    this.userNameManager.remove(name);
  } else if (type == command.SEND_MESSAGE) {
    this.MessagerInst.sendMessage(name);
  } else {
  	return 'unknow command';
  }
}

module.exports.Executor = Executor;