"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var bouncy = null;
    var map;
    var tileset;
    var layer;
    var player;
    var facing = 'left';
    var jumpTimer = 0;
    var cursors;
    var jumpButton;
    var bg;

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    
    return {
        
        create: function () {
    
            game.physics.startSystem(Phaser.Physics.ARCADE);

            game.stage.backgroundColor = '#000000';

            bg = game.add.tileSprite(0, 0, 800, 600, 'background');
            bg.fixedToCamera = true;

            map = game.add.tilemap('level1');

            map.addTilesetImage('tiles-1');

            map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

            layer = map.createLayer('Tile Layer 1');

            //  Un-comment this on to see the collision tiles
            // layer.debug = true;

            layer.resizeWorld();

            game.physics.arcade.gravity.y = 250;

            player = game.add.sprite(32, 32, 'dude');
            game.physics.enable(player, Phaser.Physics.ARCADE);

            player.body.bounce.y = 0.2;
            player.body.collideWorldBounds = true;
            player.body.setSize(20, 32, 5, 16);

            player.animations.add('left', [0, 1, 2, 3], 10, true);
            player.animations.add('turn', [4], 20, true);
            player.animations.add('right', [5, 6, 7, 8], 10, true);

            game.camera.follow(player);

            cursors = game.input.keyboard.createCursorKeys();
            jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        },
    
        update: function () {
    
            game.physics.arcade.collide(player, layer);

            player.body.velocity.x = 0;

            if (cursors.left.isDown)
            {
                player.body.velocity.x = -150;

                if (facing != 'left')
                {
                    player.animations.play('left');
                    facing = 'left';
                }
            }
            else if (cursors.right.isDown)
            {
                player.body.velocity.x = 150;

                if (facing != 'right')
                {
                    player.animations.play('right');
                    facing = 'right';
                }
            }
            else
            {
                if (facing != 'idle')
                {
                    player.animations.stop();

                    if (facing == 'left')
                    {
                        player.frame = 0;
                    }
                    else
                    {
                        player.frame = 5;
                    }

                    facing = 'idle';
                }
            }

            if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
            {
                player.body.velocity.y = -250;
                jumpTimer = game.time.now + 750;
            }
    };
};
