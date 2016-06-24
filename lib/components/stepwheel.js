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

module.exports = StepWheel;