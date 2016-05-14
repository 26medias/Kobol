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
			velocity:			400,
			drag:				20,
			angularVelocity:	300
		}, options);
		
		this.actions	= ['none', 'left', 'right', 'forward'];
		
		this.onUpdate	= [];
	};
	ship.prototype.init	= function() {
		var scope = this;
		
		// Create the ship
		this.player = this.kobol.game.add.sprite(this.options.position.x, this.options.position.y, this.options.sprite);
		this.player.anchor.set(0.5);
		this.player.enableBody			= true;
		
		this.kobol.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		
		this.player.body.drag.set(this.options.drag);
    	this.player.body.maxVelocity.set(this.options.velocity);
    	
    	
		this.createSensors(50,20);
    	
    	if (this.options.control == 'autopilot') {
    		this.autopilot_init();
    	}
		
	};
	ship.prototype.autopilot_init	= function() {
		var scope = this;
		var num_inputs		= 3;
		var num_actions		= 4;
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
	};
	
	
	ship.prototype.createSensors	= function(r, n) {
		var scope = this;
		
		var sensorArray	= [];
		
		var sensors				= scope.kobol.game.add.group();
		sensors.enableBody		= true;
		sensors.physicsBodyType	= Phaser.Physics.ARCADE;
		
		_.each(_.range(0,n,1), function(i) {
			var x = (r*Math.cos(360/n*i*Math.PI/180))-(scope.player.body.width/4);
			var y = (r*Math.sin(360/n*i*Math.PI/180))-(scope.player.body.height/4);
			var sensor				= sensors.create(x, y, 'ship-sensor');
			sensor.name				= 'sensor-'+i;
			scope.player.addChild(sensors);
			
		});
		
		scope.onUpdate.push(function() {
			//console.log("overlap",sensors, scope.kobol.env);
			scope.kobol.game.physics.arcade.overlap(sensors, scope.kobol.env, function(sensor, env) {
				console.log(">",sensor, env);
			}, null, this);
		});
		
		/*
		_.each(_.range(0,n,1), function(i) {
			var x = (r*Math.cos(360/n*i*Math.PI/180))-(scope.player.body.width/4);
			var y = (r*Math.sin(360/n*i*Math.PI/180))-(scope.player.body.height/4);
			var sensor = scope.kobol.game.add.sprite(x, y, 'ship-sensor');
			scope.player.addChild(sensor);
			
			scope.onUpdate.push(function() {
				scope.kobol.game.physics.arcade.overlap(bullets, veggies, collisionHandler, null, this);
			});
		});
		*/
	};
	ship.prototype.update	= function() {
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
			var action	= this.actions[this.brain.forward([0,0,0])];
			switch (action) {
				default:
				case "none":
					this.player.body.acceleration.set(0);
					this.player.body.angularVelocity = 0;
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
		}
		
		_.each(this.onUpdate, function(fn) {
			fn();
		});
		
		this.kobol.screenWrap(this.player);
	};

	window.ship	= ship;
})()