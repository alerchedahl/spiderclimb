var GameWon = function(game){};

GameWon.prototype = {

  	create: function(){
		titleText(this.game, 'You beat the demo!');
		subtitleText(this.game, 'Press space to play again');

		var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.addOnce(this.restartGame, this);
	},

	restartGame: function(){
		this.game.state.start("StartGame");
	}
	
}