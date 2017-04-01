var Main = function(game){

};

Main.prototype = {

	create: function() {
	    var me = this;

	    // Set the background colour to blue
	    me.game.stage.backgroundColor = '#ccddff';
		// background
		me.game.add.sprite(0, -300, 'bg');

	    // Start the P2 Physics Engine
	    me.game.physics.startSystem(Phaser.Physics.P2JS);

	    // Create collision groups
	    me.playerCollisionGroup = me.game.physics.p2.createCollisionGroup();
	    me.webCollisionGroup = me.game.physics.p2.createCollisionGroup();
	    me.blockCollisionGroup = me.game.physics.p2.createCollisionGroup();


		game.physics.p2.setImpactEvents(true);
	    
		// Set the gravity
	    me.game.physics.p2.gravity.y = 1000;

	    // Create a random generator
	    var seed = Date.now();
	    me.random = new Phaser.RandomDataGenerator([seed]);

		// Register keys
		me.registerKeys();

		me.createPlatforms();

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

	playerStanding: function() {
	    var me = this;

		var yAxis = p2.vec2.fromValues(0, 1);
		var result = false;
		function checkConstraint(c) {
			if (c.bodyA === me.player.body.data || c.bodyB === me.player.body.data) {
				var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
				if (c.bodyA === me.player.body.data) d *= -1;
				if (d > 0.5) result = true; // cos(60 degrees) = 0.5, so we can lean 30 degrees
			}
		}
		game.physics.p2.world.narrowphase.contactEquations.forEach(checkConstraint);
		return result;
	},

	update: function() {
	    var me = this;

	    // let arrow follow player
   		me.arrow.x = me.player.x;
    	me.arrow.y = me.player.y;

		me.standing = me.playerStanding();//me.player.body.touching && me.player.body.touching.down;
		me.extraWeb = false;

		if (me.spaceKey.justUp) {
			if (!me.player.swinging || me.extraWeb) {
				me.fire();
			}
			else {
				me.cutRope();
			}
		}

		if (me.cursors.up.justUp && me.player.swinging) {
			me.pullRope();
		}

		if (me.cursors.left.isDown) {
			if (me.cursors.left.shiftKey===true)
			{
				// aim
				me.arrow.rotation -= 0.05;
			} else if (me.standing) {
				// move
				me.player.body.velocity.x = -50;
			}
		}
		if (me.cursors.right.isDown) {
			if (me.cursors.right.shiftKey===true)
			{
				// aim
				me.arrow.rotation += 0.05;
			} else if (me.standing) {
				// move
				me.player.body.velocity.x = 50;
			}
		}

	    //Update the position of the rope
		if (me.player.swinging) {
		    me.drawRope();
		}
//		me.platform[0].key.render();
	},

	registerKeys: function() {
		var me = this;

		me.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    	// stop the following keys from propagating up to the browser
        me.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

	    me.cursors = game.input.keyboard.createCursorKeys();
		//me.cursors.up.onInputDown(me.pullRope);
	},

	createPlatforms: function () {
	    var me = this;

		function createPlatform(data, index) {
			// // Define a block using bitmap data rather than an image sprite
			var blockShape = me.game.add.bitmapData(data.width, data.height);

			// Fill the block with black color
			blockShape.ctx.rect(0, 0, data.width, data.height);
			blockShape.ctx.fillStyle = '#abc';
			blockShape.ctx.fill();
			
			// // Create a new sprite using the bitmap data
			me.platform[index] = me.game.add.sprite(data.x, data.y, blockShape);
// 			me.platform[index] = me.game.add.sprite(data.x, data.y, 'ground');

			// // Enable P2 Physics and set the block not to move
			me.game.physics.p2.enable([me.platform[index]], true);
			me.platform[index].body.static = true;
			me.platform[index].anchor.setTo(data.x, data.y);
			me.platform[index].body.setCollisionGroup(me.blockCollisionGroup);
			me.platform[index].body.collides([
				me.playerCollisionGroup,
				me.webCollisionGroup,
			]);
			// me.platform[index].inputEnabled = true;
			// me.platform[index].events.onInputDown.add(me.changeRope, this);


			//me.platform[index] = me.platforms.create(data.x, data.y, 'ground');
			//me.platform[index].body.immovable = true;			
		}

		var platformData = [
			{ x: me.game.world.width/2, y: me.game.world.height - 32, width: me.game.world.width, height: 64 },
			{ x: me.game.world.width-100, y: 400, width: 200, height: 32 },
			{ x: 100, y: 200, width: 200, height: 32 }
		]

		me.platform = [];
		platformData.forEach(createPlatform);
	},

	createBlock: function() {
	    var me = this;

	    // Define a block using bitmap data rather than an image sprite
	    var blockShape = me.game.add.bitmapData(me.game.world.width, 20);

	    // Fill the block with black color
	    blockShape.ctx.rect(0, 0, me.game.world.width, 20);
	    blockShape.ctx.fillStyle = '#2b3';
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

	newRope: function(body, point) {
	    var me = this;

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);

	    //Create new spring at pointer x and y
		var len = Phaser.Point.distance(me.player, point, false);
		var pull = 1
	    me.rope = me.game.physics.p2.createSpring(body, me.player, len*pull, 100, 3, [-point.x, -point.y]);
		me.player.swinging = true;
		console.log('New rope with length', len);
		console.log('Rope now has length', me.rope.data.restLength);
	    me.ropeAnchorX = point.x;
	    me.ropeAnchorY = point.y
	},

	changeRope: function(sprite, pointer) {
	    var me = this;

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);

	    //Create new spring at pointer x and y
		var len = Phaser.Point.distance(me.player, pointer, false);
		var pull = 1
	    me.rope = me.game.physics.p2.createSpring(me.block, me.player, len*pull, 100, 3, [-pointer.x, -pointer.y]);
		me.player.swinging = true;
		console.log('Changed to rope with length', len);
		console.log('Rope now has length', me.rope.data.restLength);
	    me.ropeAnchorX = pointer.x;
	    me.ropeAnchorY = pointer.y
	},

	pullRope: function() {
	    console.log('pull');
		var me = this;

	    //Create new spring with shorter rest length
		//var len = me.rope.data.restLength;
		var len = Phaser.Point.distance(me.player, { x: me.ropeAnchorX, y: me.ropeAnchorY }, false);
		console.log('Rope had length', len);
		var step = 30;
		var newLen = Math.max(len-step, 3);
		console.log('Pulled to rope with length', newLen);
		console.log('Rope now has length', me.rope.data.restLength);

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);

	    me.rope = me.game.physics.p2.createSpring(me.block, me.player, newLen, 100, 3, [-me.ropeAnchorX, -me.ropeAnchorY]);
	},

	cutRope: function() {
		var me = this;

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);
		me.player.swinging = false;
	},

	fire: function() {
		console.log('Fire!');
		var me = this;

		if (me.web) me.web.kill();
		// instantiate web
		me.web = game.add.sprite(me.player.x, me.player.y, 'projectile');
		me.web.anchor.set(0.5, 0.5);
		me.game.physics.p2.enable([me.web]);
		me.web.body.gravity.y = 300;
	    me.web.body.setCollisionGroup(me.webCollisionGroup);
	    me.web.body.collides([
	        me.blockCollisionGroup,
	    ]);
		// collide the web projectile and the platforms
		me.web.body.createGroupCallback(me.blockCollisionGroup, me.webHit, me);

		var magnitude = 900;
		var firingAngle = (me.arrow.angle - 90) * Math.PI / 180;
		me.web.body.velocity.x = magnitude * Math.cos(firingAngle) + me.player.body.velocity.x;
		me.web.body.velocity.y = magnitude * Math.sin(firingAngle) + me.player.body.velocity.y;
		if (!me.standing) {
			me.player.body.velocity.x -= 0.1 * magnitude * Math.cos(firingAngle);
			me.player.body.velocity.y -= 0.1 * magnitude * Math.sin(firingAngle);
		}
	},

	webHit: function(web, block, webShape, blockShape) {
	    var me = this;

		console.log('web hit', web.x, web.y);
		me.newRope(block, me.web);
		// remove the projectile - the rope remains
		me.web.body.removeNextStep = true;
		me.web.destroy();
	},

	createPlayer: function() {
	    var me = this;

	    // Add the player to the game
	    me.player = me.game.add.sprite(200, 400, 'spider');

	    // Enable physics, use "true" to enable debug drawing
	    me.game.physics.p2.enable([me.player], false);

	    // Get rid of current bounding box
	    //me.player.body.clearShapes();

	    // Add our PhysicsEditor bounding shape
	    //me.player.body.loadPolygon("sprite_physics", "betty");
	    // Define the players collision group and make it collide with the block and fruits
	    me.player.body.setCollisionGroup(me.playerCollisionGroup);
	    me.player.body.collides([
	        me.blockCollisionGroup,
	    ]);

		me.player.swinging = false;
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
		me.player.swinging = true;

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