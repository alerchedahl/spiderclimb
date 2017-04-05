var Main = function(game){

};

Main.prototype = {

	create: function() {
	    var me = this;

		var levels = [ level1, level2, level3 ];
		var level = levels[this.game.state.level];
		console.log('Creating level ', this.game.state.level);

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
	    me.killCollisionGroup = me.game.physics.p2.createCollisionGroup();
	    me.winCollisionGroup = me.game.physics.p2.createCollisionGroup();

		game.physics.p2.setImpactEvents(true);
	    
		// Set the gravity
	    me.game.physics.p2.gravity.y = 1000;

		// Register keys
		me.registerKeys();

		// Create the level - platforms and enemies
		me.createLevel(level);

	    // Create the player
	    me.createPlayer(level);

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

		me.standing = me.playerStanding();
		me.extraWeb = false;

		me.canShoot = !me.player.swinging || me.extraWeb;

		if (me.canShoot) {
			me.arrow.alpha = 1;
		} else {
			me.arrow.alpha = 0;
		}

		if (me.spaceKey.justUp) {
			if (me.canShoot) {
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
	},

	registerKeys: function() {
		var me = this;

		me.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    	// stop the following keys from propagating up to the browser
        me.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

	    me.cursors = game.input.keyboard.createCursorKeys();
	},

	createLevel: function (level) {
	    var me = this;

		function createPlatform(data) {
			// // Define a block using bitmap data rather than an image sprite
			var blockShape = me.game.add.bitmapData(data.width, data.height);

			// Fill the block with color
			blockShape.ctx.rect(0, 0, data.width, data.height);
			if (data.deadly) {
				blockShape.ctx.fillStyle = '#a23';
			} else {
				blockShape.ctx.fillStyle = '#567';
			}
			blockShape.ctx.fill();
			
			// // Create a new sprite using the bitmap data
			var platform = me.game.add.sprite(data.x, data.y, blockShape);

			// // Enable P2 Physics and set the block not to move
			me.game.physics.p2.enable([platform]);
			platform.body.static = true;
			//platform.anchor.setTo(data.x, data.y);
			if (data.deadly) {
				platform.body.setCollisionGroup(me.killCollisionGroup);
			} else {
				platform.body.setCollisionGroup(me.blockCollisionGroup);
			}
			platform.body.collides([
				me.playerCollisionGroup,
				me.webCollisionGroup,
			]);
		}

		function createWinPortal(data) {
			// Create a new sprite
			var platform = me.game.add.sprite(data.x, data.y, 'dwelling');

			// Enable P2 Physics and set the block not to move
			me.game.physics.p2.enable([platform]);
			platform.body.static = true;
			platform.body.setCollisionGroup(me.winCollisionGroup);
			platform.body.collides([
				me.playerCollisionGroup,
				me.webCollisionGroup,
			]);
		}
		
		level.staticPlatforms.forEach(createPlatform);
		level.winPortals.forEach(createWinPortal);
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
		// console.log('New rope with length', len);
		// console.log('Rope now has length', me.rope.data.restLength);
	    me.ropeAnchorX = point.x;
	    me.ropeAnchorY = point.y;
		me.ropeAnchorBody = body;
	},

	pullRope: function() {
	    // console.log('pull');
		var me = this;

	    //Create new spring with shorter rest length
		//var len = me.rope.data.restLength;
		var len = Phaser.Point.distance(me.player, { x: me.ropeAnchorX, y: me.ropeAnchorY }, false);
		// console.log('Rope had length', len);
		var step = 30;
		var newLen = Math.max(len-step, 3);
		// console.log('Pulled to rope with length', newLen);
		// console.log('Rope now has length', me.rope.data.restLength);

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);

	    me.rope = me.game.physics.p2.createSpring(me.ropeAnchorBody, me.player, newLen, 100, 3, [-me.ropeAnchorX, -me.ropeAnchorY]);
	},

	cutRope: function() {
		var me = this;

	    //Remove last spring
	    me.game.physics.p2.removeSpring(me.rope);
		me.player.swinging = false;
		me.clearRope();
	},

	fire: function() {
		// console.log('Fire!');
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

		// console.log('web hit', web.x, web.y);
		me.newRope(block, me.web);
		// remove the projectile - the rope remains
		me.web.body.removeNextStep = true;
		me.web.destroy();
	},

	createPlayer: function(level) {
	    var me = this;

	    // Add the player to the game
	    me.player = me.game.add.sprite(level.start.x, level.start.y, 'spider');

	    // Enable physics, use "true" to enable debug drawing
	    me.game.physics.p2.enable([me.player]);

	    // Get rid of current bounding box
	    //me.player.body.clearShapes();

	    // Add our PhysicsEditor bounding shape
	    //me.player.body.loadPolygon("sprite_physics", "betty");
	    // Define the players collision group and make it collide with the block and fruits
	    me.player.body.setCollisionGroup(me.playerCollisionGroup);
	    me.player.body.collides([
	        me.blockCollisionGroup,
	        me.killCollisionGroup,
	        me.winCollisionGroup,
	    ]);

		// collide the player and deadly platforms
		me.player.body.createGroupCallback(me.killCollisionGroup, me.playerHit, me);
		// collide the player and win portals
		me.player.body.createGroupCallback(me.winCollisionGroup, me.playerWin, me);

		me.player.swinging = false;
	},

	playerHit: function() {
		console.log('We died!');
		this.game.state.lives -= 1;
		if (this.game.state.lives > 0) {
			this.game.state.start("Main");
		} else {
			this.game.state.start("GameOver");			
		}
	},

	playerWin: function() {
		console.log('We win!');
		this.game.state.level += 1;
		console.log('On to level', this.game.state.level);
		if (this.game.state.level <= this.game.state.maxLevel) {
			this.game.state.start("Main");
		} else {
			this.game.state.start("GameWon");			
		}
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
		// if player should start out swinging, add spring and line here
	},
	
	clearRope: function() {
	    var me = this;

	    me.ropeBitmapData.clear();
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