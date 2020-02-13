"use strict";

window.onload = function() {
    
//     var config = {
//        type: Phaser.AUTO,
//        width: 800,
//        height: 600,
//        parent: 'game',
//        scene: [ Breakout ],
//        physics: {
//            default: 'arcade'
//        }
//    };
    
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

    function preload() {

        game.load.atlas('breakout', 'assets/breakout/breakout.png', 'assets/breakout/breakout.json');
        game.load.image('paddleclam', 'assets/breakout/blueclam.png');
        game.load.image('ballpearl', 'assets/breakout/pearl.png');
        game.load.image('ocean', 'assets/breakout/ocean.png');
        game.load.audio('music', 'assets/breakout/Magicant-VG.mp3');

    }

    var ball;
    var ball2;
    var paddle;
    var bricks;
    
//  var music;    

    var ballOnPaddle = true;
    var ball2OnPaddle = true;

    var lives = 3;
    var score = 0;

    var scoreText;
    var livesText;
    var introText;

    var s;

    function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  We check bounds collisions against all walls other than the bottom one
        game.physics.arcade.checkCollision.down = false;

//        music.loopFull(0.6);
        
        const backgroundSound = game.add.audio('music', 0.5, true);
        backgroundSound.play();
        
        s = game.add.tileSprite(0, 0, 800, 600, 'ocean');

        bricks = game.add.group();
        bricks.enableBody = true;
        bricks.physicsBodyType = Phaser.Physics.ARCADE;

        var brick;

        for (var y = 0; y < 4; y++)
        {
            for (var x = 0; x < 15; x++)
            {
                brick = bricks.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_' + (y+1) + '_1.png');
                brick.body.bounce.set(1);
                brick.body.immovable = true;
            }
        }

        paddle = game.add.sprite(game.world.centerX, 500, 'paddleclam');
        paddle.anchor.setTo(0.5, 0.5);

        game.physics.enable(paddle, Phaser.Physics.ARCADE);

        paddle.body.collideWorldBounds = true;
        paddle.body.bounce.set(1);
        paddle.body.immovable = true;

        ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'ballpearl');
        ball.anchor.set(0.5);
        ball.checkWorldBounds = true;
        ball2 = game.add.sprite(game.world.centerX, paddle.y - 16, 'ballpearl');
        ball2.anchor.set(0.5);
        ball2.checkWorldBounds = true;

        game.physics.enable(ball, Phaser.Physics.ARCADE);
        game.physics.enable(ball2, Phaser.Physics.ARCADE);

        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);
        ball2.body.collideWorldBounds = true;
        ball2.body.bounce.set(1);

        ball.events.onOutOfBounds.add(ballLost, this);
        ball2.events.onOutOfBounds.add(ballLost, this);

        scoreText = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
        livesText = game.add.text(680, 550, 'pearls: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
        introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
        introText.anchor.setTo(0.5, 0.5);

        game.input.onDown.add(releaseBall, this);
        game.input.onDown.add(releaseBall2, this);

    }

    function update () {

        //  Fun, but a little sea-sick inducing :) Uncomment if you like!
        // s.tilePosition.x += (game.input.speed.x / 2);

        paddle.x = game.input.x;

        if (paddle.x < 24)
        {
            paddle.x = 24;
        }
        else if (paddle.x > game.width - 24)
        {
            paddle.x = game.width - 24;
        }

        if (ballOnPaddle)
        {
            ball.body.x = paddle.x;
        }
        else
        {
            game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
            game.physics.arcade.collide(ball2, paddle, ball2HitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
            game.physics.arcade.collide(ball2, bricks, ball2HitBrick, null, this);
        }

    }

    function releaseBall () {

        if (ballOnPaddle)
        {
            ballOnPaddle = false;
            ball.body.velocity.y = -300;
            ball.body.velocity.x = -75;
            introText.visible = false;
        }

    }
    
    function releaseBall2 () {

        if (ball2OnPaddle)
        {
            ball2OnPaddle = false;
            ball2.body.velocity.y = -300;
            ball2.body.velocity.x = -75;
            introText.visible = false;
        }

    }

    function ballLost () {

        lives--;
        livesText.text = 'lives: ' + lives;

        if (lives === 0)
        {
            gameOver();
        }
        else
        {
            ballOnPaddle = true;
            ball2OnPaddle = true;

            ball.reset(paddle.body.x + 16, paddle.y - 16);
            ball2.reset(paddle.body.x + 16, paddle.y - 16);

            ball.animations.stop();
            ball2.animations.stop();
        }

    }
    

    function gameOver () {

        ball.body.velocity.setTo(0, 0);

        introText.text = 'Game Over!';
        introText.visible = true;

    }

    function ballHitBrick (_ball, _brick) {

        _brick.kill();

        score += 10;

        scoreText.text = 'score: ' + score;

        //  Are they any bricks left?
        if (bricks.countLiving() == 0)
        {
            //  New level starts
            score += 1000;
            scoreText.text = 'score: ' + score;
            introText.text = '- Next Level -';

            //  Let's move the ball back to the paddle
            ballOnPaddle = true;
            ball.body.velocity.set(0);
            ball.x = paddle.x + 16;
            ball.y = paddle.y - 16;
            ball.animations.stop();

            //  And bring the bricks back from the dead :)
            bricks.callAll('revive');
        }

    }
    
    function ball2HitBrick (_ball2, _brick) {

        _brick.kill();

        score += 10;

        scoreText.text = 'score: ' + score;

        //  Are they any bricks left?
        if (bricks.countLiving() == 0)
        {
            //  New level starts
            score += 1000;
            scoreText.text = 'score: ' + score;
            introText.text = '- Next Level -';

            //  Let's move ball2 back to the paddle
            ball2OnPaddle = true;
            ball2.body.velocity.set(0);
            ball2.x = paddle.x + 16;
            ball2.y = paddle.y - 16;
            ball2.animations.stop();

            //  And bring the bricks back from the dead :)
            bricks.callAll('revive');
        }

    }

    function ballHitPaddle (_ball, _paddle) {

        var diff = 0;

        if (_ball.x < _paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = _paddle.x - _ball.x;
            _ball.body.velocity.x = (-10 * diff);
        }
        else if (_ball.x > _paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = _ball.x -_paddle.x;
            _ball.body.velocity.x = (10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            _ball.body.velocity.x = 2 + Math.random() * 8;
        }

    }
    
    function ball2HitPaddle (_ball2, _paddle) {

        var diff = 0;

        if (_ball2.x < _paddle.x)
        {
            //  Ball2 is on the left-hand side of the paddle
            diff = _paddle.x - _ball2.x;
            _ball2.body.velocity.x = (-10 * diff);
        }
        else if (_ball2.x > _paddle.x)
        {
            //  Ball2 is on the right-hand side of the paddle
            diff = _ball2.x -_paddle.x;
            _ball2.body.velocity.x = (10 * diff);
        }
        else
        {
            //  Ball2 is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            _ball2.body.velocity.x = 2 + Math.random() * 8;
        }

    }

}
