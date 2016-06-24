function Button(name,config,controller) {
  var pressed = 0;
  var bitmask = parseInt(config.bitmask,16);

  this.parseInput = function(data) {
    var isPressed = data[config.addr] & bitmask;
    if(pressed ^ isPressed) {
      pressed = isPressed;
      controller.emit(name + (pressed ? ":pressed" : ":released"));
    }
  }
};

module.exports = Button;