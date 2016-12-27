const bodyChanType = require('./BodyChangeType').BodyChangeType
var Initiator = function(snakeManager, bordManager) {
  this.snakeManager = snakeManager;
  this.bordManager = bordManager;
}

Initiator.prototype.sendCurrentData = function() {
  this.bordManager.generateFood();
  this.bordManager.sendCurrentData(); // food data
  this.snakeManager.sendCurrentData(); // snake data
  this.snakeManager.provideInfo(bodyChanType.ADD);
}

module.exports = Initiator;