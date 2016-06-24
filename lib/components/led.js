var LED = function(config,controller) {
  var brightness = 0;

  var updateOutputPacket = function() {
    controller.outPacket[config.addr] = brightness == 1 ? 127 : Math.floor(brightness*128);
    controller.invalidateOutput();
  };

  return {
    setBrightness: function(newBrightness) {
      brightness = newBrightness;
      updateOutputPacket();
    },
    setOn: function() {
      brightness = 1;
      updateOutputPacket();
    },
    setOff: function() {
      brightness = 0;
      updateOutputPacket();
    }
  };
};

module.exports = LED;