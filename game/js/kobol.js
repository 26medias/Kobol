(function() {
	var kobol	= function(id, options) {
		this.dom_id		= id;
		this.options	= _.extend({
			fullwidth:	false,
			width:		800,
			height:		600
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
		
		this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'space');
		
		this.build();
		
		// Manual ship
		this.ship	= new ship(this, {
			control:	'manual',
			position:	{
				x:	100,
				y:	100
			}
		});
		this.ship.init();
		
		
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
		
		
		
	};
	kobol.prototype.build	= function() {
		var scope = this;
		
		this.env					= this.game.add.group();
		this.env.enableBody			= true;
		this.env.physicsBodyType	= Phaser.Physics.ARCADE;
		
		_.each(_.range(0,10,1), function(i) {
			var asteroid			= scope.env.create(_.random(50,scope.game.world.width-50), _.random(50,scope.game.world.height-50), 'asteroid');
			asteroid.name			= 'asteroid-'+i;
			asteroid.body.immovable	= true;
		});
		
		
	};
	kobol.prototype.update	= function() {
		this.ship.update();
		this.cylon.update();
		this.alien.update();
	};
	kobol.prototype.screenWrap	= function(actor) {
		if (actor.x < 0) {
			actor.x = this.game.width;
		} else if (actor.x > this.game.width) {
			actor.x = 0;
		}

		if (actor.y < 0) {
			actor.y = this.game.height;
		} else if (actor.y > this.game.height) {
			actor.y = 0;
		}
		return true;
	};

	window.kobol	= kobol;
})()