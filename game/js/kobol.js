(function() {
	var kobol	= function(id, options) {
		this.dom_id		= id;
		this.options	= _.extend({
			fullwidth:	false,
			width:		800,
			height:		600,
			wWidth:		800*4,
			wHeight:	600*2
		}, options);
	};
	kobol.prototype.init	= function() {
		var scope = this;
		
		if (this.options.fullscreen) {
			$('#'+this.dom_id).css({
				position:	'fixed',
				top:		0,
				left:		0,
				width:		'100%',
				height:		'100%'
			});
			this.options.width	= Math.round($('#'+this.dom_id).innerWidth());
			this.options.height	= Math.round($('#'+this.dom_id).innerHeight());
		}
		
		this.game = new Phaser.Game(this.options.width, this.options.height, Phaser.AUTO, this.dom_id, {
			preload:	function() {
				scope.preload();
			},
			create:		function() {
				scope.create();
			},
			update:		function() {
				scope.update();
			}
		});
	};
	kobol.prototype.preload	= function() {
		var scope = this;
		this.game.load.image('space', 'assets/images/background/deep-space.jpg');
		this.game.load.image('ship-small', 'assets/images/ships/small.png');
		this.game.load.image('ship-eagle', 'assets/images/ships/eagle.png');
		this.game.load.image('ship-alien', 'assets/images/ships/alien.png');
		this.game.load.image('ship-sensor', 'assets/images/ships/items/sensor.png');
		this.game.load.image('asteroid', 'assets/images/asteroids/s01.png');
	};
	kobol.prototype.create	= function() {
		var scope = this;
		
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.keyboard	= this.game.input.keyboard.createCursorKeys();
		
		this.game.add.tileSprite(0, 0, this.options.wWidth, this.options.wHeight, 'space');
		
		this.game.world.setBounds(0, 0, this.options.wWidth, this.options.wHeight);
		
		this.build();
		
		// Manual ship
		this.ship	= new ship(this, {
			control:	'autopilot',
			position:	{
				x:	this.game.width/2,
				y:	this.game.height/2
			}
		});
		this.ship.init();
		
		this.game.camera.follow(this.ship.player, Phaser.Camera.FOLLOW_TOPDOWN);
		
		/*
		// Autopilot ship
		this.cylon	= new ship(this, {
			sprite:		'ship-eagle',
			control:	'autopilot',
			position:	{
				x:	250,
				y:	250
			}
		});
		this.cylon.init();
		
		this.alien	= new ship(this, {
			sprite:		'ship-alien',
			control:	'autopilot',
			position:	{
				x:	500,
				y:	500
			},
			velocity:			600,
			drag:				200,
			angularVelocity:	500
		});
		this.alien.init();
		*/
		
		
	};
	kobol.prototype.build	= function() {
		var scope = this;
		
		this.env				= this.game.add.physicsGroup();
		
		_.each(_.range(0,30,1), function(i) {
			var asteroid			= scope.env.create(_.random(50,scope.game.world.width-50), _.random(50,scope.game.world.height-50), 'asteroid');
			//asteroid.body.immovable	= true;
			//asteroid.name			= 'asteroid-'+i;
			//asteroid.body.mass		= -100;
		});
		
		
	};
	kobol.prototype.update	= function() {
		this.ship.update();
		//this.cylon.update();
		//this.alien.update();
	};
	kobol.prototype.screenWrap	= function(actor) {
		if (actor.x < 0) {
			actor.x = this.options.wWidth;
		} else if (actor.x > this.options.wWidth) {
			actor.x = 0;
		}

		if (actor.y < 0) {
			actor.y = this.options.wHeight;
		} else if (actor.y > this.options.wHeight) {
			actor.y = 0;
		}
		return true;
	};

	window.kobol	= kobol;
})()