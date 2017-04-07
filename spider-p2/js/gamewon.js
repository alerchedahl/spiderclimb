var GameWon = function(game){};

GameWon.prototype = {

  	create: function(){
		this.game.add.text(100, 100, 'You beat the demo!');
		this.game.add.text(100, 200, 'Press space to play again');

		var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.addOnce(this.restartGame, this);
	},

	restartGame: function(){
		this.game.state.start("StartGame");
	}
	
}