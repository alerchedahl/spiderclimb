var GameTitle = function(game){};

GameTitle.prototype = {

	create: function(){
		this.game.add.text(100, 100, 'Spider Climb!');
	},

	startGame: function(){
		this.game.state.start("Main");
	}

}