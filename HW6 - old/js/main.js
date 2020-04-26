var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 768,
    height: 384,
    zoom: 2,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to view zones
        }
    },
    scene: [
        BootScene,
        PlatformScene,
        BattleScene,
        UIScene
    ]
};
var game = new Phaser.Game(config);