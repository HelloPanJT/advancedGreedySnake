var SnakeManager = require('./SnakeManager');
var BoardManager = require('./BoardManager').BoardManager;
var ColorProvider = require('./ColorProvider');
var Initiator = require('./Initiator');

const command = require('./CommandSC').CommandSC;

var Executor = function(io) {
  this.BoardManagerInst = new BoardManager(io);
  var ColorProviderInst = new ColorProvider();
  this.SnakeManager = new SnakeManager(this.BoardManagerInst, ColorProviderInst);
  this.Initiator = new Initiator(this.SnakeManager, this.BoardManagerInst);
  this.userNameManager = require('./UserNameManager');
}

Executor.prototype.execute = function(type, name, dir) {
  if (type == command.CREATE_SNAKE) {
  	this.SnakeManager.addSnake('client', name);
  	this.BoardManagerInst.generateFood();
  } else if (type == command.CHANGE_DIR) {
  	this.SnakeManager.changeDir(name, dir);
  } else if (type == command.GET_CURRENTDATA) {
  	this.Initiator.sendCurrentData();
  } else if (type == command.CHECK_USERNAME) {
    if (!this.userNameManager.exist(name)) {
      this.userNameManager.add(name);
      return false;
    } 
    return true;
  } else if (type == command.DELETE_USERNAME) {
    this.SnakeManager.killSnake('clientSnake', name);
    this.userNameManager.remove(name);
  }else {
  	return 'unknow command';
  }
}

module.exports.Executor = Executor;