function Slider(name,config,controller) {
  var _position = 0;

  var value = 0;

  this.parseInput = function(data) {
    newPos = data[config.lsb] + (data[config.msb] << 8);
    if(newPos != _position) {
      _position = newPos;
      if(_position < 10)
        var value = 0;
      else if(_position >= 4080)
        var value = 1;
      else
        var value = _position/4096
      controller.emit(name + ':changed',{value:value});
    }
  }
};

module.exports = Slider;
