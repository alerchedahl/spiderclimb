var GameWon = function(game){};

GameWon.prototype = {

  	create: function(){

	},

	restartGame: function(){
		this.game.state.start("GameTitle");
	}
	
}