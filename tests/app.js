var traktorF1 = require('../lib/traktor_f1');
var tinycolor = require('tinycolor2');
var _ = require('lodash');

var rows = 4;
var cols = 4;

var f1 = new traktorF1.TraktorF1();

var layers = [];

var Layer = function() {
	this.active = false;
	this.editing = false;
	this.brightness = 0;

	this.colors = [];
	this.timing = {};
	this.effect = function() {};
	this.group = {};
};

Layer.prototype.isActive = function() {
	return this.active && !!this.brightness;
}

var userLayer = 0;


f1.on('l1:pressed', function(e) {
	setUserLayer(0);
});
f1.on('l2:pressed', function(e) {
	setUserLayer(1);
});
f1.on('l3:pressed', function(e) {
	setUserLayer(2);
});
f1.on('l4:pressed', function(e) {
	setUserLayer(3);
});

var setUserLayer = function(layerNum) {
	f1.setLED('l1_l',0);
	f1.setLED('l2_l',0);
	f1.setLED('l3_l',0);
	f1.setLED('l4_l',0);
	f1.setLED('l'+(layerNum+1)+'_l',1);
};


var bpm = 128;

f1.setLCDDot("l",1);


f1.on('browse:pressed',function(e) {
	f1.setLED('browse',1);
	f1.setLED('sync',1);
	f1.setLED('quant',1);
	f1.setLED('capture',1);
	f1.setLED('shift',1);
	f1.setLED('reverse',1);
	f1.setLED('type',1);
	f1.setLED('size',1);
});
f1.on('browse:released',function(e) {
	f1.setLED('browse',0);
	f1.setLED('sync',0);
	f1.setLED('quant',0);
	f1.setLED('capture',0);
	f1.setLED('shift',0);
	f1.setLED('reverse',0);
	f1.setLED('type',0);
	f1.setLED('size',0);
});

var current = 0;

var bpmChanged = false;
f1.on('stepper:step',function(e) {
	if(e.direction == 1) {
		bpm++;
	}
	else {
		bpm--;
	}
	bpmChanged = true;
	f1.setLCDString(Number(bpm%100).toString());
	f1.setLCDDot("l",(bpm >= 100));
	f1.setLCDDot("r",(bpm >= 200));

});

f1.setLED("l1_r",1);
f1.setLED("l2_r",1);
f1.setLED("l3_r",1);
f1.setLED("l4_r",1);


//f1.setRGB('p1',0,1,0);

var count = 0;

var beatFirstHalf2 = true;
var lastBeatMillis = new Date().getTime();

var beatPulse2 = function() {
	if(beatFirstHalf2) {
		f1.setLED('quant',1);
		lastBeatMillis = (new Date().getTime());
	}
	else
		f1.setLED('quant',0);
	beatFirstHalf2 = !beatFirstHalf2;
	if(bpmChanged) {
		clearInterval(pulseInterval);
		pulseInterval = setInterval(beatPulse2,30000/bpm);
		bpmChanged = false;
	}
};

var pulseInterval = setInterval(beatPulse2,30000/bpm);


var frameProgress = 0;

var doFrame = function() {
	var newFrameProgress = ((new Date().getTime()) - lastBeatMillis) / (60000/bpm);
	if(newFrameProgress < frameProgress)
		f1.setLED('capture',1);
	else
		f1.setLED('capture',0);
	frameProgress = newFrameProgress;
};

setInterval(doFrame,25);

doFrame();


var hue=0, sat=0, val=0, dist = 1;

var setRGBsToCanvas = function() {
	/*var pixels = ctx.getImageData(0,0,4,4).data;
	console.log(pixels);
	for(var i=0; i<16; i++) {
		var pixIndex = i*4;
		var alpha = pixels[pixIndex+3]/255;
		f1.setRGB('p'+(i+1),alpha*pixels[pixIndex],alpha*pixels[pixIndex+1],alpha*pixels[pixIndex+2]);
	}*/
};


var setAllRGBs = function() {
	for(var a=1; a<=16; a++)
		f1.setRGB('p'+a,0,0,0);
	var colors = tinycolor({h:hue,s:sat,v:val}).analogous(17,dist);
	for(var a=0, b=1; a < 16; a++, b = (b+1)%colors.length) {
		//var c = (Math.floor(a/4)+b)%4;
		var c = b;
		f1.setRGB('p'+(a+1),colors[c]._r,colors[c]._g,colors[c]._b);
	}
};

f1.on('s1:changed',function(e) {
	hue = e.value*360;
	setAllRGBs();
});

f1.on('s2:changed',function(e) {
	sat = e.value;
	setAllRGBs();
});

f1.on('s3:changed',function(e) {
	val = e.value;
	setAllRGBs();
});

f1.on('s4:changed',function(e) {
	dist = Math.floor(e.value*100)+1;
	setAllRGBs();
});

var flashOffCount = 0;

setInterval(function() {
	if(flashOffCount < 5) {
		f1.setLED('shift',0);
		flashOffCount++;
	}
	else {
		f1.setLED('shift',1);
		flashOffCount = 0;
	}
},25);

var strobeInteravl = null;
var strobeOffCount = 0;

f1.on('shift:pressed',function() {
	strobeInterval = setInterval(function() {
		if(strobeOffCount < 3) {
			for(var a=1; a<=16; a++)
				f1.setRGB('p'+a,0,0,0);
			strobeOffCount++;
		}
		else {
			for(var a=1; a<=16; a++)
				f1.setRGB('p'+a,255,255,255);
			strobeOffCount = 0;
		}
	},20);
});

f1.on('shift:released',function(e) {
	if(!!strobeInterval)
		clearInterval(strobeInterval);
});

f1.on('reverse:pressed',setRGBsToCanvas);

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}
