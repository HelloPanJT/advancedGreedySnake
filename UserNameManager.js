var UserNameManager = function() {
  this.userName = new Set();
}

UserNameManager.prototype.exist = function(name) {
  return this.userName.has(name);
}

UserNameManager.prototype.add = function(name) {
  this.userName.add(name);
}

UserNameManager.prototype.remove = function(name) {
  this.userName.delete(name);
}
module.exports = new UserNameManager();