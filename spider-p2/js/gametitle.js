var GameTitle = function(game){};

GameTitle.prototype = {

	create: function(){
	    // Set the background colour to blue
	    this.game.stage.backgroundColor = '#ccddff';

		this.game.add.text(100, 100, 'Spider Climb!');
		this.game.add.text(100, 200, 'Press space to start');

		var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.addOnce(this.startGame, this);
	},

	startGame: function(){
		this.game.state.start("StartGame");
	}

}