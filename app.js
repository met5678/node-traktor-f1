var traktorF1 = require('./traktor_f1');

var f1 = new traktorF1.TraktorF1();

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
/*f1.on('stepper:step',function(e) {
	if(e.direction == 1) {
		current++;
	}
	else {
		current--;
	}
	if(current < 0)
		current = 35;
	if(current > 35)
		current = 0;
	f1.setLCDChar('l',current.toString(36));
	f1.setLCDChar('r',current.toString(36));
});*/

f1.setLCDString("f1");
f1.setLED("l1_l",.5);
f1.setLED("l4_r",1);

f1.setLCDDot("l",1);

//f1.setRGB('p1',0,1,0);

var count = 0;

setInterval(function() {
	count++;
	if(count > 16) {
		count = 0;
		for(var a=1; a<=16; a++)
			f1.setRGB('p'+a,0,0,0);
	}
	else {
		f1.setRGB('p'+count,Math.random(),Math.random(),Math.random());
	}
},10);


/*var HID = require('../node-hid');
var _ = require('underscore');

var devices = HID.devices();

var f1Stub = _.find(devices, function(device) { return device.vendorId == 6092 && device.productId == 4384 });

if(!f1Stub) {
	console.log("No F1 found");
	return;
}

var f1 = new HID.HID(f1Stub.path);
console.log("F1 found");

var outPacket = new Buffer(81);
outPacket[0] = 0x80;
var index = 0;
var value = 0x7f;



var onData = function(data) {
	console.log(data.toJSON());
	index = (data[5]%80);

	var r = Math.floor((data[14]+data[15]*256)/32);
	var g = Math.floor((data[16]+data[17]*256)/32);
	var b = Math.floor((data[18]+data[19]*256)/32);
	var a = Math.floor((data[20]+data[21]*256)/32);
	var c = Math.floor((data[6]+data[7]*256)/32);
	var d = Math.floor((data[8]+data[9]*256)/32);
	var e = Math.floor((data[10]+data[11]*256)/32);
	var f = Math.floor((data[12]+data[13]*256)/32);

	outPacket.fill(0,1);
	outPacket[index+1] = r;
	outPacket[(index+1)%80+1] = g;
	outPacket[(index+2)%80+1] = b;
	outPacket[(index+3)%80+1] = a;
	outPacket[(index+4)%80+1] = c;
	outPacket[(index+5)%80+1] = d;
	outPacket[(index+6)%80+1] = e;
	outPacket[(index+7)%80+1] = f;
	f1.write(outPacket);
};

f1.on("data",onData);*/