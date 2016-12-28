var constantSet = require('./ConstantSet').ConstantSet;
var boardParams = require('./BoardParams').boardParams;
var Utility = function() {
}

Utility.prototype.getRandomKey = function(set){
  var size=Object.keys(set).length;
  var rad=Math.floor(Math.random()*size);
  var i=0;
  for (var key in set) {
	  if(i==rad) {
	    return key;
	  }
	  i++;
  }
  return constantSet.NONE;
}

Utility.prototype.getRandomElement = function(array) {
  if (array.length == 0) {
    return constantSet.NONE;
  }
  var index = this.getRandomInt(0, array.length - 1);
  for (var i = 0; i <= index; i++) {
    if (i == index) {
      return array[i];
    }
  }
}

Utility.prototype.num2RC = function(num) {
  return {row: Math.floor(num / boardParams.WIDTH), col: num % boardParams.HEIGHT}
}

Utility.prototype.RC2Num = function(pos) {
  return pos.row * boardParams.WIDTH + pos.col;
}

Utility.prototype.eleToArray = function(ele) {
  var data = [];
  data.push(ele);
  return data;
}
Utility.prototype.deleteElement = function(array, ele) {
  var index = array.indexOf(ele);
  if (index >=0 && index <array.length) {
    array.splice(index, 1);
  }
}

Utility.prototype.getLastElement = function(array) {
  if (array.length > 0) {
    return array[array.length - 1];
  }
  return constantSet.NONE;
}

Utility.prototype.getFirstElement = function(array) {
  if (array.length > 0) {
    return array[0];
  }
  return constantSet.NONE;
}

// generate a Integer between min and max(included min and max)
Utility.prototype.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Utility.prototype.setToArray = function(set) {
  var data = [];
  var size = set.size;
  var it = set.values();
  for (var i = 0; i < size; i++) {
    data.push(it.next().value);
  }
  return data;
}

Utility.prototype.bodyToNumArray = function(body) {
  var data = [];
  for (var i = 0; i < body.length; i++) {
    data.push(this.RC2Num(body[i]));
  }
  return data;
}

exports.Utility = new Utility();