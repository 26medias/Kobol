(function() {
	var ship	= function(kobol, options) {
		this.kobol		= kobol;
		this.options	= _.extend({
			sprite:		'ship-small',
			control:	'autopilot',
			position:	{
				x:	50,
				y:	50
			},
			velocity:			200,
			drag:				100,
			angularVelocity:	300,
			sensor:	{
				degree:		45,
				spacing:	50,
				layers:		7,
				count:		8
			},
			period:		100
		}, options);
		
		this.actions	= ['none', 'left', 'right', 'forward'];
		
		this.onUpdate	= [];
		
		this.rewards		= [];
		this.cycleCounter	= 0;
		
		this.inputs	= {
			sensors:	[],
			velocity:	0,
			panR:		0,
			panL:		0
		};
		
		this.avionics	= this.kobol.game.add.group();
		
		this.lastAction = new Date().getTime();
	};
	ship.prototype.init	= function() {
		var scope = this;
		
		// Create the ship
		this.player = this.kobol.game.add.sprite(this.options.position.x, this.options.position.y, this.options.sprite);
		this.player.anchor.set(0.5);
		//this.player.enableBody			= true;
		
		this.kobol.game.physics.enable(this.player);
		
		this.player.body.drag.set(this.options.drag);
    	this.player.body.maxVelocity.set(this.options.velocity);
    	
    	if (this.options.control == 'autopilot') {
    		this.autopilot_init();
    	}
		
		this.createSensors(this.options.sensor.spacing, this.options.sensor.layers, this.options.sensor.count);
		
		
		window.getBrain	= function() {
			return scope.brain;
		};
		
	};
	
	
	ship.prototype.createPctBar	= function(x, y, w, h) {
		if (!w) {w = 10;}
		if (!h) {h = 30;}
		
		var bg = this.kobol.game.add.graphics(x,y);
		bg.beginFill(0x096AA1);
		bg.drawRect(0, 0, w, h);
		
		var fg = this.kobol.game.add.graphics(x,y);
		fg.beginFill(0x39B3F4);
		fg.drawRect(0, 0, w, h);
		
		this.avionics.add(bg);
		this.avionics.add(fg);
		
		return {
			set:	function(v) {
				fg.height	= Math.round(h*v);
				fg.y		= y+(h-fg.height);
			}
		}
	};
	ship.prototype.createText	= function(x, y, label) {
		
    	var style	= {font: "20px Courier", fill: "#fff", tabs: 132};
		var text	= this.kobol.game.add.text(x, y, label+":\t", style);
		
		this.avionics.add(text);
		
		return {
			set:	function(v) {
				text.setText(label+":\t"+v);
			}
		}
	};
	ship.prototype.createAngle	= function(x, y, r) {
		
		var bg = this.kobol.game.add.graphics(x,y);
		bg.beginFill(0x096AA1);
		bg.drawCircle(0, 0, r);
		
		var fg = this.kobol.game.add.graphics(x,y);
		fg.beginFill(0x39B3F4);
		fg.drawRect(-2, 0, 4, r/2);
		
		this.avionics.add(bg);
		this.avionics.add(fg);
		
		return {
			set:	function(v) {
				fg.angle	= v;
			}
		}
	};
	
	
	ship.prototype.createSensors	= function(r, l, n) {
		var scope = this;
		
		this.sensors		= [];
		var sensors			= scope.kobol.game.add.group();
		
		var c = 0;
		_.each(_.range(0,scope.options.sensor.layers,1), function(layer) {
			_.each(_.range(0,scope.options.sensor.count,1), function(i) {
				var sensor		= sensors.create(0, 0, 'ship-sensor');
				sensor.name		= c+'.'+layer+'.'+i;
				scope.kobol.game.physics.enable(sensor);
				scope.sensors.push(sensor);
				sensor.body.moves = false;
				c++;
			});
		});
		
		
		var speed	= this.createPctBar(80, 20);
		var panL	= this.createPctBar(90, 20);
		var panR	= this.createPctBar(100, 20);
		
		
		var sensorDisplays	= [];
		var sensorBuffer	= [];
		var sensorValues	= [];
		
		// Create the sensor inputs
		_.each(_.range(0,this.options.sensor.count,1), function(i) {
			sensorDisplays.push(scope.createPctBar(110+i*10, 20));
			sensorBuffer.push(false);
			sensorValues.push(0);
		});
		
		//var rewardBar	= this.createPctBar(100+this.options.sensor.count*10+15, 20);
		
		var vector	= this.createText(20, 60, "vector");
		var angle	= this.createText(20, 80, "angle");
		var rVector	= this.createText(20, 100, "r-vector");
		var tReward	= this.createText(20, 120, "reward");
		
		var aAngle	= this.createAngle(35,35,30);
		var aVector	= this.createAngle(65,35,30);
		
		
		
		
		
		scope.onUpdate.push(function() {
			
			// Reset the sensor data
			sensorBuffer	= _.map(sensorBuffer, function() {return false;});
			sensorValues	= _.map(sensorValues, function() {return 0;});
			
			var inputs		= [];
			var reward		= [];
			
			var i;
			for (i=0;i<scope.sensors.length;i++) {
				inputs.push(0);
			}
			
			// Update the position and rotation of the sensors
			var _x = scope.player.x;
			var _y = scope.player.y;
			var _r = scope.player.rotation;
			var c = 0;
			_.each(_.range(0,scope.options.sensor.layers,1), function(layer) {
				layer++;
				_.each(_.range(0,scope.options.sensor.count,1), function(i) {
					var sensor	= sensors.getAt(c);
					var x = _x+(scope.options.sensor.spacing*layer*Math.cos(((scope.options.sensor.degree/(scope.options.sensor.count-1)*i-(scope.options.sensor.degree/2)))*Math.PI/180+_r))-(scope.player.body.width/4);
					var y = _y+(scope.options.sensor.spacing*layer*Math.sin(((scope.options.sensor.degree/(scope.options.sensor.count-1)*i-(scope.options.sensor.degree/2)))*Math.PI/180+_r))-(scope.player.body.height/4);
					sensor.position.x	= x;
					sensor.position.y	= y;
					c++;
				});
			});
			
			scope.kobol.game.physics.arcade.overlap(scope.kobol.env, sensors, null, function(env, sensor) {
				var info	= sensor.name.split('.');	// index, layer, col
				var layer	= parseInt(info[1]);
				var col		= parseInt(info[2]);
				if (sensorBuffer[col]==false) {
					sensorBuffer[col] = layer;
				} else {
					if (layer<sensorBuffer[col]) {
						sensorBuffer[col]	= layer;
					}
				}
			}, this);
			
			//console.log("sensorBuffer",sensorBuffer);
			_.each(sensorBuffer,function(item, i) {
				if (item!==false) {
					sensorValues[i]	= (scope.options.sensor.layers-item)/scope.options.sensor.layers;
					sensorDisplays[i].set(sensorValues[i]);
				} else {
					sensorValues[i]	= 0;
					sensorDisplays[i].set(0);
				}
			});
			
			
			scope.inputs.sensors	= sensorValues;
			
			// Calculate the velocity
			var velocity	= Math.sqrt(Math.pow(scope.player.body.velocity.x,2)+Math.pow(scope.player.body.velocity.y,2))/Math.sqrt(Math.pow(scope.options.velocity,2)+Math.pow(scope.options.velocity,2));
			
			// Display the velocity
			speed.set(velocity);
			
			// Calculate the vector and angle
			var _vector	= (Math.atan2(scope.player.body.velocity.y,scope.player.body.velocity.x)-(90*Math.PI/180))*180/Math.PI;
			var _angle	= ((scope.player.rotation-(90*Math.PI/180))*180/Math.PI)
			
			// Display
			vector.set(_vector.toFixed(2));
			aVector.set(_vector);
			
			angle.set(_angle.toFixed(2));
			aAngle.set(_angle);
			
			var pan	= _vector-_angle;
			
			rVector.set(pan.toFixed(2));
			
			
			scope.inputs.velocity	= velocity;
			scope.inputs.panR		= Math.max(0,Math.min(1,-pan/180));
			scope.inputs.panL		= Math.max(0,Math.min(1,pan/180));
			
			if (pan<0) {
				panR.set(scope.inputs.panR);
				panL.set(0);
			} else {
				panR.set(0);
				panL.set(scope.inputs.panL);
			}
			
			
			// Calculate the reward
			var reward	= 0;
			var sensorValue	= 0;
			// Calculate the sum
			_.each(scope.inputs.sensors, function(v) {
				sensorValue	+= v;
			});
			sensorValue	/= scope.inputs.sensors.length;
			
			var negValue	= 0;
			if (sensorValue>0) {
				negValue	= sensorValue*0.7;
			}
			negValue	+= (scope.inputs.panR+scope.inputs.panL)/2*0.3;
			
			
			if (negValue > 0.05) {
				reward	= -negValue;
			} else {
				reward	= (0.5-Math.abs(scope.inputs.velocity-0.5))*2;
			}
			
			tReward.set(reward.toFixed(2));
			
			scope.reward	= reward;
			
		});
		
	};
	ship.prototype.update	= function() {
		var scope = this;
		
		//console.clear();
		//console.log(Math.sqrt(Math.pow(this.player.body.velocity.x,2)+Math.pow(this.player.body.velocity.y,2)), Math.sqrt(Math.pow(400,2)+Math.pow(400,2)));
		
		
		this.avionics.x	= this.player.x;
		this.avionics.y	= this.player.y+10;
		
		
		if (this.brain && this.reward) {
			scope.brain.backward(this.reward);
		}
		
		
		_.each(this.onUpdate, function(fn) {
			fn();
		});
		
		if (this.options.control == 'manual') {
			// Manual control
			if (this.kobol.keyboard.up.isDown) {
				this.kobol.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
			} else if (this.kobol.keyboard.down.isDown) {
				this.kobol.game.physics.arcade.accelerationFromRotation(this.player.rotation, -200, this.player.body.acceleration);
			} else {
				this.player.body.acceleration.set(0);
			}
			
			if (this.kobol.keyboard.left.isDown) {
				this.player.body.angularVelocity = -this.options.angularVelocity;
			} else if (this.kobol.keyboard.right.isDown) {
				this.player.body.angularVelocity = this.options.angularVelocity;
			} else {
				this.player.body.angularVelocity = 0;
			}
		} else {
			// Autopilot
			var now = new Date().getTime();
			var delta	= now-this.lastAction;
			if (delta >= this.options.period) {
				
				//console.log("d",delta);
				
				this.lastAction = new Date().getTime();
				this.actionStarted = true;
				
				if (this.inputs.sensors.length==0) {
					var inputs = [];
					var i;
					for (i=0;i<scope.options.sensor.count+3;i++) {
						inputs.push(0);
					}
					//console.log(inputs.length);
					var action	= this.actions[this.brain.forward(inputs)];
				} else {
					var inputs = [];
					var i;
					for (i=0;i<this.inputs.sensors.length;i++) {
						inputs.push(this.inputs.sensors[i]);
					}
					inputs.push(this.inputs.velocity);
					inputs.push(this.inputs.panR);
					inputs.push(this.inputs.panL);
					//console.log(inputs.length);
					var action	= this.actions[this.brain.forward(inputs)];
				}
				
				switch (action) {
					default:
					case "none":
						//this.player.body.acceleration.set(0);
						//this.player.body.angularVelocity = 0;
					break;
					case "backward":
						this.kobol.game.physics.arcade.accelerationFromRotation(this.player.rotation, -200, this.player.body.acceleration);
					break;
					case "forward":
						this.kobol.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
					break;
					case "left":
						this.player.body.angularVelocity = -this.options.angularVelocity;
					break;
					case "right":
						this.player.body.angularVelocity = this.options.angularVelocity;
					break;
				}
			} else {
				if (this.actionStarted) {
					//this.player.body.acceleration.set(0);
					this.player.body.angularVelocity = 0;
					this.actionStarted	= false;
				}
				
			}
			
		}
		
		this.kobol.screenWrap(this.player);
	};
	
	ship.prototype.autopilot_init	= function() {
		var scope = this;
		
		var num_inputs		= this.options.sensor.count+3;
		var num_actions		= this.actions.length;
		var temporal_window	= 2;
		var network_size	= num_inputs*temporal_window + num_actions*temporal_window + num_inputs;
		var layer_defs = [];
		layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
		layer_defs.push({type:'fc', num_neurons: 30, activation:'relu'});
		layer_defs.push({type:'fc', num_neurons: 30, activation:'relu'});
		layer_defs.push({type:'regression', num_neurons:num_actions});
		var tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};
		var opt = {};
		opt.temporal_window			= temporal_window;
		opt.experience_size			= 30000;
		opt.start_learn_threshold	= 1000;
		opt.gamma					= 0.7;
		opt.learning_steps_total	= 200000;
		opt.learning_steps_burnin	= 3000;
		opt.epsilon_min				= 0.05;
		opt.epsilon_test_time		= 0.05;
		opt.layer_defs				= layer_defs;
		opt.tdtrainer_options		= tdtrainer_options;
		this.brain = new deepqlearn.Brain(num_inputs, num_actions, opt);
		
		window.brains.push({
			sprite:	this.options.sprite,
			brain:	this.brain
		});
	};

	window.ship	= ship;
})()