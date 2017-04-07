var StartGame = function(game){};

StartGame.prototype = {

	create: function(){
		this.game.state.lives = 5;
		this.game.state.level = 5;
		this.game.state.maxLevel = levels.length-1;
		this.game.state.start("Main");
	}
}