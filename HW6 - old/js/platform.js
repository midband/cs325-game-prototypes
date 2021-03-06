var PlatformScene = new Phaser.class({
    
    Extends: Phaser.Scene,

    initialize:

    function PlatformScene ()
    {
        Phaser.Scene.call(this, { key: 'PlatformScene' });
    },

    preload: function ()
    {
        
    },

    create: function ()
    {
        // load the map 
        var map = this.make.tilemap({key: 'map'});

        var score = 0;

        // tiles for the ground layer
        var groundTiles = map.addTilesetImage('tiles');
        // create the ground layer
        var groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
        // the player will collide with this layer
        groundLayer.setCollisionByExclusion([-1]);

        // coin image used as tileset
        var coinTiles = map.addTilesetImage('coin');
        // add coins as tiles
        var coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

        // set the boundaries of our game world
        this.physics.world.bounds.width = groundLayer.width;
        this.physics.world.bounds.height = groundLayer.height;

        // create the player sprite    
        var player = this.physics.add.sprite(200, 200, 'playerSprite');
        player.setBounce(0.2); // our player will bounce from items
        player.setCollideWorldBounds(true); // don't go out of the map    
        
        // small fix to our player images, we resize the physics body object slightly
        player.body.setSize(player.width, player.height-8);
        
        // player will collide with the level tiles 
        this.physics.add.collider(groundLayer, player);

        coinLayer.setTileIndexCallback(17, collectCoin, this);
        // when the player overlaps with a tile with index 17, collectCoin 
        // will be called    
        this.physics.add.overlap(player, coinLayer);

        // player walk animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
            frameRate: 10,
            repeat: -1
        });
        // idle with only one frame, so repeat is not neaded
        this.anims.create({
            key: 'idle',
            frames: [{key: 'player', frame: 'p1_stand'}],
            frameRate: 10,
        });


        var cursors = this.input.keyboard.createCursorKeys();

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(player);

        // set background color, so the sky is not black    
        this.cameras.main.setBackgroundColor('#ccccff');

        // this text will show the score
        var text = this.add.text(20, 570, '0', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        // fix the text to the camera
        text.setScrollFactor(0);
    },

    // this function will be called when the player touches a coin
    collectCoin: function(sprite, tile) {
        coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
        score++; // add 10 points to the score
        text.setText(score); // set the text to show the current score
        return false;
    },

    update: function(time, delta) {
        if (cursors.left.isDown)
        {
            player.body.setVelocityX(-200);
            player.anims.play('walk', true); // walk left
            player.flipX = true; // flip the sprite to the left
        }
        else if (cursors.right.isDown)
        {
            player.body.setVelocityX(200);
            player.anims.play('walk', true);
            player.flipX = false; // use the original sprite looking to the right
        } else {
            player.body.setVelocityX(0);
            player.anims.play('idle', true);
        }
        // jump 
        if (cursors.up.isDown && player.body.onFloor())
        {
            player.body.setVelocityY(-500);        
        }
    }  

});