var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    preload: function ()
    {  
        this.load.audio('music', 'assets/Go lins 2.mp3');
        // map tiles
        this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight: 70});
        this.load.image('colored', 'assets/battleground/colored.png');
        
        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.tilemapTiledJSON('battleground', 'assets/battleground/battleground.json');
        
        // enemies
        this.load.image("dragonblue", "assets/dragonblue.png");
        this.load.image("dragonorrange", "assets/dragonorrange.png");

        this.load.image('coin', 'assets/coinGold.png');
        this.load.atlas('playerSprite', 'assets/player.png', 'assets/player.json');
        
        // our two characters
        this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
    },

    create: function ()
    {
        // start the PlatformScene
        this.scene.start('PlatformScene');
    }
});