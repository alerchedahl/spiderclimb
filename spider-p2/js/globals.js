levels = [];

function titleText(game, title) {
    var style = { font: "bold 32px Arial", fill: "#567", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 150
    text = game.add.text(0, 0, title, style);
    // text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 150, 800, 100);    
}

function subtitleText(game, subtitle) {
    var style = { font: "bold 16px Arial", fill: "#395", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 300
    text = game.add.text(0, 0, subtitle, style);
    // text.setShadow(1, 1, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 300, 800, 100);    
}