var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    preload: function ()
    {  
        // music
        this.load.audio('music', 'assets/Go lins 2.mp3');

        // sound effects
        this.load.audio('scrollSound', 'assets/toggle_004.ogg');
        this.load.audio('selectSound', 'assets/confirmation_001.ogg');
        this.load.audio('fireSound', 'assets/confirmation_002.ogg');
        this.load.audio('enemyFireSound', 'assets/error_003.ogg');

        // map tiles
        this.load.image('tiles', 'assets/map/spritesheet.png');
        this.load.image('colored', 'assets/battleground/colored.png');
        
        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/map/map.json');
        this.load.tilemapTiledJSON('battleground', 'assets/battleground/battleground.json');
        
        // enemies
        this.load.image("dragonblue", "assets/dragonblue.png");
        this.load.image("dragonorrange", "assets/dragonorrange.png");
        
        // our two characters
        this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
    },

    create: function ()
    {
        // start the WorldScene
        this.scene.start('WorldScene');
    }
});