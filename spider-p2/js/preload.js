var Preload = function(game){};

Preload.prototype = {

	preload: function(){
		this.game.load.image('bg', 'assets/bg.jpg');
    	this.game.load.image('ground', 'assets/platform.png');
    	this.game.load.image('dwelling', 'assets/dwelling.png');
    	this.game.load.spritesheet('spider', 'assets/spider_trimmed.png');
    	this.game.load.spritesheet('projectile', 'assets/projectile.png');
    	this.game.load.image('arrow', 'assets/arrow.png');

	    this.game.load.physics("sprite_physics", "assets/sprite_physics.json");
	},

	create: function(){
		this.game.state.lives = 5;
		this.game.state.level = 5;
		this.game.state.maxLevel = levels.length-1;
		this.game.state.start("Main");
	}
}