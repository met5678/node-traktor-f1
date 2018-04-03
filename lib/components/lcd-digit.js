const LCDchars = require('../7segment_chars.json');

function LCDDigit(config,controller) {
  var char = ' ';
  var dotBrightness = 0;
  var brightness = 1;
  var segmentBits = 0x00;

  var updateOutputPacket = function() {
    var value = Math.floor(brightness*127);
    controller.outPacket[config.a] = (segmentBits & 0x01) ? value : 0;
    controller.outPacket[config.b] = (segmentBits & 0x02) ? value : 0;
    controller.outPacket[config.c] = (segmentBits & 0x04) ? value : 0;
    controller.outPacket[config.d] = (segmentBits & 0x08) ? value : 0;
    controller.outPacket[config.e] = (segmentBits & 0x10) ? value : 0;
    controller.outPacket[config.f] = (segmentBits & 0x20) ? value : 0;
    controller.outPacket[config.g] = (segmentBits & 0x40) ? value : 0;
    controller.outPacket[config.dp] = Math.floor(dotBrightness*127);
    controller.invalidateOutput();
  };

  return {
    setChar:function(newChar) {
      if(newChar.length != 1)
        return;

      if(!isNaN(parseInt(newChar))) {
        char = "d" + newChar;
      }
      else {
        char = newChar.toLowerCase();
      }

      if(!!LCDchars[char]) {
        segmentBits = LCDchars[char];
        updateOutputPacket();
      }
    },
    setPattern:function(segments) {
      // Not yet implemented
    },
    setDot:function(newDotBrightness) {
      if(newDotBrightness != dotBrightness) {
        dotBrightness = newDotBrightness;
        updateOutputPacket();
      }
    },
    setBrightness:function(newBrightness) {
      if(newBrightness != brightness) {
        brightness = newBrightness;
        updateOutputPacket();
      }
    }
  }
};

module.exports = LCDDigit;
