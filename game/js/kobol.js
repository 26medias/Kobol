(function() {
	var kobol	= function(id, options) {
		this.dom_id		= id;
		this.options	= _.extend({
			width:	800,
			height:	600
		}, options);
	};
	kobol.prototype.init	= function() {
		var scope = this;
		
		var game = new Phaser.Game(this.options.width, this.options.height, Phaser.AUTO, this.dom_id, {
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
		
	};
	kobol.prototype.create	= function() {
		var scope = this;
		
	};
	kobol.prototype.update	= function() {
		var scope = this;
		
	};
	
	window.kobol	= kobol;
})()