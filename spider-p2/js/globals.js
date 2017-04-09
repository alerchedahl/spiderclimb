levels = [];

function titleText(game, title) {
    var style = { font: "bold 32px Arial", fill: "#567", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 150
    var text = game.add.text(0.5, 0.5, title, style);
    // text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 150, 800, 100);    
}

function subtitleText(game, subtitle) {
    var style = { font: "bold 16px Arial", fill: "#395", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 300
    var text = game.add.text(0.5, 0.5, subtitle, style);
    // text.setShadow(1, 1, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 300, 800, 100);    
}

function levelText(game, title) {
    var style = { font: "bold 32px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 150
    var text = game.add.text(0.5, 0.5, title, style);
    // text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 150, 800, 100);
    // game.time.events.add(2000,
    //     function() {
    //         //game.add.tween(text).to({scale: 1.2}, 1500, Phaser.Easing.Linear.None, true);
    //         game.add.tween(text).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
    //     }, game);
}
