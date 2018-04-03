var LED_RGB = function(config,controller) {
  var r = 0;
  var g = 0;
  var b = 0;

  var updateOutputPacket = function() {
    controller.outPacket[config.rAddr] = Math.floor(r/2);
    controller.outPacket[config.gAddr] = Math.floor(g/2);
    controller.outPacket[config.bAddr] = Math.floor(b/2);
    controller.invalidateOutput();
  };

  return {
    setRGB:function(newR,newG,newB) {
      r = newR;
      g = newG;
      b = newB;
      updateOutputPacket();
    }
  };
};

module.exports = LED_RGB;
