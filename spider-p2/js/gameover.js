var GameOver = function(game){};

GameOver.prototype = {

  	create: function(){
		titleText(this.game, 'Game Over');
		subtitleText(this.game, 'Press space to try again');

		var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.addOnce(this.restartGame, this);
	},

	restartGame: function(){
		this.game.state.start("StartGame");
	}
	
}