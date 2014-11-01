var Emitter = require('events').EventEmitter,
	_ = require('underscore');

var BeatManager = function() {
	this.bpm = 128;
	this.interval = null;

	var changeBPM = function(newBPM) {
		if(!!this.interval)
			clearInterval(this.interval);

		
	};

	this.incBPM = function() {
		changeBPM(this.bpm+1);
	};

	this.decBPM = function() {
		changeBPM(this.bpm-1);
	};

	this.setBPM = function(newBPM) {
		changeBPM(newBPM,true);
	};
};

util.inherits(BeatManager, Emitter);

module.exports = BeatManager;