// http-server ./

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.image('bg', 'assets/bg.jpg');
    game.load.image('ground', 'assets/platform.png');
    game.load.spritesheet('spider', 'assets/spider_trimmed.png');
    game.load.spritesheet('projectile', 'assets/projectile.png');
    game.load.image('arrow', 'assets/arrow.png');
}

var spaceKey;
var platforms;
var player;
var arrow;
var web;
var webLine;
var line;
var gfx;
var pointerArrow;
var text1;
var text2;
        
var playerRadius = 10;

function create() {

    //register mouse input
    text1 = this.add.text(10, 10, '', { fill: '#00ff00' });
    text2 = this.add.text(500, 10, '', { fill: '#00ff00' });

    this.input.mouse.disableContextMenu();

    this.input.on('pointerup', function (pointer) {

        if (pointer.leftButtonReleased())
        {
            console.log('dfdf')
            text2.setText('Left Button was released');
        }
        else if (pointer.rightButtonReleased())
        {
            text2.setText('Right Button was released');
        }
    });

    // register keys
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    // stop the following keys from propagating up to the browser
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    // enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // background
    game.add.sprite(0, -300, 'bg');

    // the platforms group contains the ground and the ledges we can jump on
    platforms = game.add.group();
    platforms.enableBody = true; // enable physics for any object that is created in this group
    var ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true; // stop it from falling away when you jump on it
    // create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // player
    player = game.add.sprite(300, game.world.height - 64 - 12, 'spider');
    //  enable physics on the player
    game.physics.arcade.enable(player);
    // The bounce gives a nice effect but currently messes with the web climbing...
    //player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.anchor.set(0.5, 0.5);

    // arrow
    arrow = game.add.sprite(player.x, player.y, 'arrow');
    arrow.anchor.setTo(0.5, 1.2);
    
    // pointer
    pointerArrow = game.add.sprite(player.x, player.y, 'arrow');
    pointerArrow.anchor.setTo(0.4, 1.2);

    // controls
    cursors = game.input.keyboard.createCursorKeys();

    // graphics used to render line between player and anchor
    gfx = game.add.graphics(0, 0);
    gfx.lineStyle(1, '#888', 1);
}

function update() {

    // handle pointer
    var pointer = this.input.activePointer;
    console.log(pointer);
    text1.setText([
        'x: ' + pointer.worldX,
        'y: ' + pointer.worldY,
        'isDown: ' + pointer.isDown
    ]);
    
    // collide the player and the platforms
    var playerHitPlatform = game.physics.arcade.collide(player, platforms);
    // collide the web projectile and the platforms
    var webHitPlatform = game.physics.arcade.collide(web, platforms);

    // instantiate 'chain' on appropriate collision
    if (webHitPlatform) {
        console.log(web.x, web.y);
        webLine = {
            anchor: {
                x: web.x,
                y: web.y
            },
            radius: Phaser.Point.distance(player, web, false) - playerRadius
        };
        // remove the projectile - the 'chain' remains
        web.kill();
    }

    // handle layer/anchor interaction as long as the webline is present
    if (webLine) {
        // current speed
        var speed = player.body.velocity.getMagnitude();
        // where we will be next
        var pos = Phaser.Point.add(player.body.position, player.body.velocity)
        var dist = Phaser.Point.distance(pos, webLine.anchor, false);
        var delta = dist - (webLine.radius);
        // console.log("delta: ", delta);
        if (delta = 0) {
            var pullDir = Phaser.Point.subtract(webLine.anchor, player.body.position);
            var dir = 0;
        }
        // only pull not push
        if (delta > 0) {
            var pullDir = Phaser.Point.subtract(webLine.anchor, pos);
            // console.log("dir: ", dir);
            // mass * spring constant
            var k = 1;
            var acc = Phaser.Point.normalize(pullDir).setMagnitude(delta * k);

            var dir = Phaser.Point.add(player.body.velocity, acc);
            var drag = 1;
            // console.log("acc: ", acc);
            player.body.velocity = Phaser.Point.normalize(dir).setMagnitude(speed * drag);
        }
    }

    // let arrow follow player
    arrow.x = player.x;
    arrow.y = player.y;

    // fire mechanism
    if (spaceKey.justReleased(50)) {
        if (webLine)
        {
            // Cut
            webLine = null;
        } else {
            fire();
        }
    }

    // reset the players velocity (movement)
    if (player.body.touching.down && playerHitPlatform) {
        player.body.velocity.x = 0;
    }

    // keyboard movement
    if (cursors.left.isDown) {
        if (cursors.left.shiftKey===true)
        {
            // aim
            arrow.rotation -= 0.05;
        } else {
            // move
            player.body.velocity.x = -50;
        }
    }
    if (cursors.right.isDown) {
        if (cursors.right.shiftKey===true)
        {
            // aim
            arrow.rotation += 0.05;
        } else {
            // move
            player.body.velocity.x = 50;
        }
    }
    if (cursors.up.isDown) {
        if (cursors.up.shiftKey===true && webLine)
        {
            var delta = 10;
            // climb
            webLine.radius -= delta;
            var dir = Phaser.Point.subtract(webLine.anchor, player.body);
            var t = Phaser.Point.normalize(dir).setMagnitude(delta);
            player.body.position = Phaser.Point.add(player.body.position, t);
        } else if (player.body.touching.down && playerHitPlatform) {
            // jump if touching the ground
            player.body.velocity.y += -150;
        }
    }

    // draw line between player and anchor
    if (webLine) {

        // find a way to redraw the line at the correct location - destroy() below doesn't work
        // if (line) {
        //     line.destroy();
        // }

        // draw the line!
        gfx.lineStyle(1, '#888', 1);
        gfx.moveTo(webLine.anchor.x, webLine.anchor.y);
        line = gfx.lineTo(player.x, player.y);
    } else if (line) {
        // remove the line if no webline - destroy() seems not to be the best way as it prevents rendering of subsequent lines...
        line.destroy();
    }
}

function render() {
    // debug info
    //game.debug.spriteInfo(arrow, 32, 32);
    //game.debug.bodyInfo(player.body, 10, 10, `#0F0`);

}

function fire() {
    if (web) web.kill();
    // instantiate web
    web = game.add.sprite(player.x, player.y, 'projectile');
    web.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(web);
    web.body.gravity.y = 300;
    web.body.collideWorldBounds = true;

    var magnitude = 500;
    var firingAngle = (arrow.angle - 90) * Math.PI / 180;
    web.body.velocity.x = magnitude * Math.cos(firingAngle);
    web.body.velocity.y = magnitude * Math.sin(firingAngle);
}
