var GameOver = function(game){};

GameOver.prototype = {

  	create: function(){
		this.game.add.text(100, 100, 'Game Over');
		this.game.add.text(100, 200, 'Press space to try again');

		var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.addOnce(this.restartGame, this);
	},

	restartGame: function(){
		this.game.state.start("StartGame");
	}
	
}