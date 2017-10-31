'use strict';

const HID = require('node-hid');
const util = require('util');
const Emitter = require('events').EventEmitter;
const _ = require('lodash');

const Button = require('./components/button');
const StepWheel = require('./components/stepwheel');
const Slider = require('./components/slider');
const LED = require('./components/led');
const LED_RGB = require('./components/led-rgb');
const LCDDigit = require('./components/lcd-digit');

const f1Config = require('./traktor_f1_config.json');

var VENDOR_ID  = 6092;
var PRODUCT_ID = 4384;

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

	this.outPacket = new Array(81);
	this.outPacket[0] = 0x80;
	for (let i = 1; i < 81; i++) {
	  this.outPacket[i] = 0;
	}

	var sendOutput = () => {
		try {
			this.device.write(this.outPacket);
			dirty = false;
		}
		catch(ex) {
			console.log("failed write", ex);
		}
	};


	this.invalidateOutput = function() {
		if(!dirty) {
			dirty = true;
			setImmediate(sendOutput);
		}
	};

	try {
		this.device = new HID.HID(VENDOR_ID,PRODUCT_ID);
	}
	catch(e) {
		console.log('Could not connect to F1',e);
	}

	this.device.on("data", this.parseInput.bind(this));
	this.device.on("error", (ex) => {
		console.log("device error:", ex);
	});
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
