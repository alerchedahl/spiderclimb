var GameOver = function(game){};

GameOver.prototype = {

  	create: function(){
		this.game.add.text(100, 100, 'Game Over');
	},

	restartGame: function(){
		this.game.state.start("GameTitle");
	}
	
}