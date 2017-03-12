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

function create() {

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

    // controls
    cursors = game.input.keyboard.createCursorKeys();

    // graphics used to render line between player and anchor
    gfx = game.add.graphics(0, 0);
    gfx.lineStyle(1, '#000', 1);
}

function update() {

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
            radius: Phaser.Point.distance(player, web, false)
        };
        // remove the projectile - the 'chain' remains
        web.kill();
    }

    // handle layer/anchor interaction as long as the webline is present
    if (webLine) {
        var dist = Phaser.Point.distance(player, webLine.anchor, false);
        var delta = dist - webLine.radius;
        var k = 10;
        var acc = Phaser.Point.normalize(Phaser.Point.subtract(webLine.anchor, player)).setMagnitude(delta * k);
        player.body.acceleration = acc;
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
    player.body.velocity.x = 0;

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
        if (cursors.right.shiftKey===true && webLine)
        {
            // climb
            webLine.radius -= 10;
        } else if (player.body.touching.down && playerHitPlatform) {
            // jump if touching the ground
            player.body.velocity.y = -150;
        }
    }

    // draw line between player and anchor
    if (webLine) {

        // find a way to redraw the line at the correct location - destroy() below doesn't work
        // if (line) {
        //     line.destroy();
        // }

        // draw the line!
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
