
var ColorProvider = function() {
  this.colorPool = ["SALMON", "HOTPINK", "GOLD", "MAGENTA",
                   "SPRINGGREEN", "LIGHTSEAGREEN", "CYAN", "TURQUOISE", 
                  "STEELBLUE", "ROYALBLUE", "WHEAT", "SANDYBROWN"];

}

ColorProvider.prototype.provideOneColor = function() {
  if (this.colorPool.length != 0) {
    return this.colorPool.shift();
  } else {
  	return "GOLD";
  }
}

ColorProvider.prototype.addOneColor = function(color) {
  this.colorPool.push(color);
}

module.exports = ColorProvider;