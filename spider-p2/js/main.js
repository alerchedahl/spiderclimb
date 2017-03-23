var Main = function(game){

};

Main.prototype = {

	create: function() {
	    var me = this;

	    // Set the background colour to blue
	    me.game.stage.backgroundColor = '#ccddff';

	    // Start the P2 Physics Engine
	    me.game.physics.startSystem(Phaser.Physics.P2JS);

	    // Set the gravity
	    me.game.physics.p2.gravity.y = 1000;

	    // Create a random generator
	    var seed = Date.now();
	    me.random = new Phaser.RandomDataGenerator([seed]);

		// Register keys
		me.registerKeys();

	    // Create the ceiling
	    me.createBlock();

	    // Create the player
	    me.createPlayer();

	    // arrow
    	me.arrow = game.add.sprite(me.player.x, me.player.y, 'arrow');
    	me.arrow.anchor.setTo(0.5, 1.2);

	    // Create rope
	    me.createRope();
	},

	update: function() {
	    var me = this;

	    // let arrow follow player
   		me.arrow.x = me.player.x;
    	me.arrow.y = me.player.y;

		if (me.spaceKey.justUp) {
			me.fire();
		}

		if (me.cursors.up.justUp) {
			me.pullRope();
		}

		if (me.cursors.left.isDown) {
			if (me.cursors.left.shiftKey===true)
			{
				// aim
				me.arrow.rotation -= 0.05;
			} else if (me.player.body.touching.down) {
				// move
				me.player.body.velocity.x = -50;
			}
		}
		if (me.cursors.right.isDown) {
			if (me.cursors.right.shiftKey===true)
			{
				// aim
				me.arrow.rotation += 0.05;
			} else if (me.player.body.touching.down) {
				// move
				me.player.body.velocity.x = 50;
			}
		}

	    //Update the position of the rope
	    me.drawRope();
	},

	registerKeys: function() {
		var me = this;

		me.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    	// stop the following keys from propagating up to the browser
        me.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

	    me.cursors = game.input.keyboard.createCursorKeys();
		//me.cursors.up.onInputDown(me.pullRope);
	},

	createBlock: function() {
	    var me = this;

	    // Define a block using bitmap data rather than an image sprite
	    var blockShape = me.game.add.bitmapData(me.game.world.width, 200);

	    // Fill the block with black color
	    blockShape.ctx.rect(0, 0, me.game.world.width, 200);
	    blockShape.ctx.fillStyle = '000';
	    blockShape.ctx.fill();

	    // Create a new sprite using the bitmap data
	    me.block = me.game.add.sprite(0, 0, blockShape);

	    // Enable P2 Physics and set the block not to move
	    me.game.physics.p2.enable(me.block);
	    me.block.body.static = true;
	    me.block.anchor.setTo(0, 0);

	    // Enable clicking on block and trigger a function when it is clicked
    	me.block.inputEnabled = true;
	    me.block.events.onInputDown.add(me.changeRope, this);
	},

	changeRope: function(sprite, pointer) {
	    var me = this;

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);

	    //Create new spring at pointer x and y
		var len = Phaser.Point.distance(me.player, pointer, false);
		var pull = 1
	    me.rope = me.game.physics.p2.createSpring(me.block, me.player, len*pull, 100, 3, [-pointer.x, -pointer.y]);
	    me.ropeAnchorX = pointer.x;
	    me.ropeAnchorY = pointer.y
	},

	pullRope: function() {
	    console.log('pull');
		var me = this;

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);

	    //Create new spring with shorter rest length
		var len = me.rope.data.restLength;
		var step = 0.3;
		var newLen = Math.max(len-step, 3);
		console.log('Rope now has length', newLen);
	    me.rope = me.game.physics.p2.createSpring(me.block, me.player, newLen, 100, 3, [-me.ropeAnchorX, -me.ropeAnchorY]);
	},

	fire: function() {
		console.log('Fire!');
		var me = this;

		if (me.web) me.web.kill();
		// instantiate web
		me.web = game.add.sprite(me.player.x, me.player.y, 'projectile');
		me.web.anchor.set(0.5, 0.5);
		me.game.physics.arcade.enable(me.web);
		me.web.body.gravity.y = 300;
		me.web.body.collideWorldBounds = true;

		var magnitude = 500;
		var firingAngle = (me.arrow.angle - 90) * Math.PI / 180;
		me.web.body.velocity.x = magnitude * Math.cos(firingAngle) + me.player.body.velocity.x;
		me.web.body.velocity.y = magnitude * Math.sin(firingAngle) + me.player.body.velocity.y;
		if (!player.body.touching.down) {
			me.player.body.velocity.x -= 0.1 * magnitude * Math.cos(firingAngle);
			me.player.body.velocity.y -= 0.1 * magnitude * Math.sin(firingAngle);
		}
	},

	createPlayer: function() {
	    var me = this;

	    // Add the player to the game
	    me.player = me.game.add.sprite(200, 400, 'spider');

	    // Enable physics, use "true" to enable debug drawing
	    me.game.physics.p2.enable([me.player], false);

	    // Get rid of current bounding box
	    me.player.body.clearShapes();

	    // Add our PhysicsEditor bounding shape
	    me.player.body.loadPolygon("sprite_physics", "betty");
	},

	createRope: function() {
	    var me = this;

	    // Add bitmap data to draw the rope
	    me.ropeBitmapData = game.add.bitmapData(me.game.world.width, me.game.world.height);

	    me.ropeBitmapData.ctx.beginPath();
	    me.ropeBitmapData.ctx.lineWidth = "4";
	    me.ropeBitmapData.ctx.strokeStyle = "#ffffff";
	    me.ropeBitmapData.ctx.stroke();

	    // Create a new sprite using the bitmap data
	    me.line = game.add.sprite(0, 0, me.ropeBitmapData);

	    // Keep track of where the rope is anchored
	    me.ropeAnchorX = (me.block.world.x + 500);
	    me.ropeAnchorY = (me.block.world.y + me.block.height);

	    // Create a spring between the player and block to act as the rope
	    me.rope = me.game.physics.p2.createSpring(
	        me.block,  // sprite 1
	        me.player, // sprite 2
	        300,       // length of the rope
	        10,        // stiffness
	        3,         // damping
	        [-(me.block.world.x + 500), -(me.block.world.y + me.block.height)]
	    );

	    // Draw a line from the player to the block to visually represent the spring
	    me.line = new Phaser.Line(me.player.x, me.player.y,
	        (me.block.world.x + 500), (me.block.world.y + me.block.height));
	},

	drawRope: function() {
	    var me = this;

	    // Change the bitmap data to reflect the new rope position
	    me.ropeBitmapData.clear();
	    me.ropeBitmapData.ctx.beginPath();
	    me.ropeBitmapData.ctx.beginPath();
	    me.ropeBitmapData.ctx.moveTo(me.player.x, me.player.y);
	    me.ropeBitmapData.ctx.lineTo(me.ropeAnchorX, me.ropeAnchorY);
	    me.ropeBitmapData.ctx.lineWidth = 4;
	    me.ropeBitmapData.ctx.stroke();
	    me.ropeBitmapData.ctx.closePath();
	    me.ropeBitmapData.render();
    },

	gameOver: function(){
		this.game.state.start('GameOver');
	},
};