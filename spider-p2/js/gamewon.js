var GameWon = function(game){};

GameWon.prototype = {

  	create: function(){
		this.game.add.text(100, 100, 'You beat the demo!');
	},

	restartGame: function(){
		this.game.state.start("GameTitle");
	}
	
}