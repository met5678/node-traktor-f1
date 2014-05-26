var HID = require('node-hid'),
	util = require('util'),
	Emitter = require('events').EventEmitter,
	_ = require('underscore'),
	f1Config = require('./traktor_f1_config.json'),
	LCDchars = require('./7segment_chars.json');

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

function StepWheel(name,config,controller) {
	var step = 0;

	this.parseInput = function(data) {
		newStep = data[config.addr];
		if(newStep == step)
			return;
		if(newStep > step) {
			controller.emit(name + ':step',{direction:1});
		}
		else if (newStep < step) {
			controller.emit(name + ':step',{direction:-1});
		}
		step = newStep;
	}
};

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

function TraktorF1() {
	var dirty = false;

	this.device = null;

	this.buttons = {};
	for(var key in f1Config.input.buttons)
		this.buttons[key] = new Button(key,f1Config.input.buttons[key],this)

	this.stepper = new StepWheel('stepper',f1Config.input.steppers.stepper,this);

	this.knobs = {};
	for(var key in f1Config.input.knobs)
		this.knobs[key] = new Slider(key,f1Config.input.knobs[key],this)

	this.sliders = {};
	for(var key in f1Config.input.sliders)
		this.sliders[key] = new Slider(key,f1Config.input.sliders[key],this)


	this.leds = {};
	for(var key in f1Config.output.leds)
		this.leds[key] = new LED(f1Config.output.leds[key],this);

	this.rgb_leds = {};
	for(var key in f1Config.output.rgb_leds)
		this.rgb_leds[key] = new LED_RGB(f1Config.output.rgb_leds[key],this);

	this.lcd = {};
	for(var key in f1Config.output.lcd)
		this.lcd[key] = new LCDDigit(f1Config.output.lcd[key],this);


	this.outPacket = new Buffer(81);
	this.outPacket[0] = 0x80;
	this.outPacket.fill(0,1);

	var sendOutput = function() {
		try {
			this.device.write(this.outPacket);
			dirty = false;
		}
		catch(ex) {
			console.log("Error");
			console.log(ex)
		}
	};


	var boundSendOutput = sendOutput.bind(this);
	this.invalidateOutput = function() {
		if(!dirty) {
			dirty = true;
			setImmediate(boundSendOutput);
		}
	};

	var devices = HID.devices();
	var f1Stub = _.find(devices, function(device) { return device.vendorId == 6092 && device.productId == 4384 });
	this.device = new HID.HID(f1Stub.path);
	this.device.on("data",this.parseInput.bind(this));
}

util.inherits(TraktorF1, Emitter);

TraktorF1.prototype.parseInput = function(data) {
	for(var key in this.buttons) {
		this.buttons[key].parseInput(data);
	}
	
	this.stepper.parseInput(data);

	for(var key in this.knobs) {
		this.knobs[key].parseInput(data);
	}

	for(var key in this.sliders) {
		this.sliders[key].parseInput(data);
	}
};

TraktorF1.prototype.setLED = function(which,value) {
	this.leds[which].setBrightness(value);
};

TraktorF1.prototype.setRGB = function(which,r,g,b) {
	this.rgb_leds[which].setRGB(r,g,b);
};

TraktorF1.prototype.setLCDChar = function(which,char) {
	this.lcd[which].setChar(char);
};

TraktorF1.prototype.setLCD = function(which,brightness) {
	this.lcd[which].setBrightness(char);
};

TraktorF1.prototype.setLCDString = function(message) {
	if(message.length == 1) {
		message = " " + message;
	}
	this.lcd.l.setChar(message[0]);
	this.lcd.r.setChar(message[1]);
}

TraktorF1.prototype.setLCDDot = function(which,brightness) {
	this.lcd[which].setDot(brightness);
};


module.exports.TraktorF1 = TraktorF1;
