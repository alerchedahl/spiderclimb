var GameTitle = function(game){};

GameTitle.prototype = {

	create: function(){
	    // Set the background colour to blue
	    this.game.stage.backgroundColor = '#ccddff';

		titleText(this.game, 'Spider Climb!');
		subtitleText(this.game, 'Press space to start');

		var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.addOnce(this.startGame, this);
	},

	startGame: function(){
		this.game.state.start("StartGame");
	}

}