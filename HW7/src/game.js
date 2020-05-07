var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
var theme;
var bossTheme;

game.state.add('play', {
    preload: function() {
        this.game.load.audio('theme', 'assets/No Reflection VG.mp3')
        
        this.game.load.image('classroom', 'assets/classroom.png');
        this.game.load.image('animalcrossing', 'assets/animalcrossing.png');
        this.game.load.image('dfa', 'assets/dfa.png');
        this.game.load.image('movie', 'assets/movie.png');
        this.game.load.image('textbook', 'assets/textbook.png');
        this.game.load.image('phaserlogo', 'assets/phaserlogo.png');
        this.game.load.image('storymatic', 'assets/storymatic.png');
        this.game.load.image('piazza', 'assets/piazza.png');
        this.game.load.image('blackboard', 'assets/blackboard.png');
        this.game.load.image('kahoot', 'assets/kahoot.png');
        this.game.load.image('professor', 'assets/professor.png');

        this.game.load.image('gold_coin', 'assets/I_GoldCoin.png');
        this.game.load.image('scroll', 'assets/I_Scroll02.png');
        this.game.load.image('book', 'assets/W_Book02.png');

        this.game.load.audio('clickSound', 'assets/tick_002.ogg');
        this.game.load.audio('goldSound', 'assets/confirmation_002.ogg');
        this.game.load.audio('enemySound', 'assets/error_006.ogg');
        this.game.load.audio('bossSound', 'assets/error_007.ogg');

        this.game.load.audio('bossTheme', 'assets/Feint VG.mp3')

        // build panel for upgrades
        var bmd = this.game.add.bitmapData(250, 500);
        bmd.ctx.fillStyle = '#d5f2f0';
        bmd.ctx.strokeStyle = '#5b8c89';
        bmd.ctx.lineWidth = 12;
        bmd.ctx.fillRect(0, 0, 250, 500);
        bmd.ctx.strokeRect(0, 0, 250, 500);
        this.game.cache.addBitmapData('upgradePanel', bmd);

        var buttonImage = this.game.add.bitmapData(476, 48);
        buttonImage.ctx.fillStyle = '#e7caeb';
        buttonImage.ctx.strokeStyle = '#5f4163';
        buttonImage.ctx.lineWidth = 4;
        buttonImage.ctx.fillRect(0, 0, 225, 48);
        buttonImage.ctx.strokeRect(0, 0, 225, 48);
        this.game.cache.addBitmapData('button', buttonImage);

        // the main player
        this.player = {
            clickDmg: 1,
            gold: 0,
            dps: 0
        };

        // world progression
        this.level = 1;
        // how many monsters have we killed during this level
        this.levelKills = 0;
        // how many monsters are required to advance a level
        this.levelKillsRequired = 10;
    },
    create: function() {
        var state = this;

        theme = this.sound.add('theme', 0.38, true);
        bossTheme = this.sound.add('bossTheme', 0.4, true);
        theme.play();

        this.background = this.game.add.image(0,0,'classroom');
        // // setup each of our background layers to take the full screen
        // ['forest-back', 'forest-lights', 'forest-middle', 'forest-front']
        //     .forEach(function(image) {
        //         var bg = state.game.add.tileSprite(0, 0, state.game.world.width,
        //             state.game.world.height, image, '', state.background);
        //         bg.tileScale.setTo(4,4);
        //     });

        this.upgradePanel = this.game.add.image(10, 70, this.game.cache.getBitmapData('upgradePanel'));
        var upgradeButtons = this.upgradePanel.addChild(this.game.add.group());
        upgradeButtons.position.setTo(8, 8);

        var upgradeButtonsData = [
            {icon: 'scroll', name: 'Learning lvl', level: 0, cost: 5, purchaseHandler: function(button, player) {
                player.clickDmg += 1;
            }},
            {icon: 'book', name: 'Auto-Learn lvl', level: 0, cost: 10, purchaseHandler: function(button, player) {
                player.dps += 5;
            }}
        ];

        var button;
        upgradeButtonsData.forEach(function(buttonData, index) {
            button = state.game.add.button(0, (50 * index), state.game.cache.getBitmapData('button'));
            button.icon = button.addChild(state.game.add.image(6, 6, buttonData.icon));
            button.text = button.addChild(state.game.add.text(42, 6, buttonData.name + ': ' + buttonData.level, {font: '16px Arial Black'}));
            button.details = buttonData;
            button.costText = button.addChild(state.game.add.text(42, 24, 'Cost: ' + buttonData.cost, {font: '16px Arial Black'}));
            button.events.onInputDown.add(state.onUpgradeButtonClick, state);

            upgradeButtons.addChild(button);
        });

        var monsterData = [
            {name: 'Deep play assignment',   image: 'animalcrossing',    maxHealth: 40},
            {name: 'Online class',    image: 'blackboard',      maxHealth: 20},
            {name: 'DFA episode',    image: 'dfa',    maxHealth: 25},
            {name: 'Piazza posts',               image: 'piazza',               maxHealth: 20},
            {name: 'A somewhat depressing film',        image: 'movie',        maxHealth: 30},
            {name: 'Learning Phaser',          image: 'phaserlogo',          maxHealth: 25},
            {name: 'Storymatic cards',   image: 'storymatic',   maxHealth: 20},
            {name: 'Textbook chapter',      image: 'textbook',      maxHealth: 20},
            {name: 'Kahoot quiz',      image: 'kahoot',      maxHealth: 30},
            {name: 'Hand-to-hand combat', image: 'professor', maxHealth: 325}
        ];
        this.monsters = this.game.add.group();

        var monster;
        monsterData.forEach(function(data) {
            // create a sprite for them off screen
            monster = state.monsters.create(1000, state.game.world.centerY, data.image);
            // use the built in health component
            monster.health = monster.maxHealth = data.maxHealth;
            // center anchor
            monster.anchor.setTo(0.5, 1);
            // reference to the database
            monster.details = data;

            //enable input so we can click it!
            monster.inputEnabled = true;
            monster.events.onInputDown.add(state.onClickMonster, state);

            // hook into health and lifecycle events
            monster.events.onKilled.add(state.onKilledMonster, state);
            monster.events.onRevived.add(state.onRevivedMonster, state);
        });

        // display the monster front and center
        this.currentMonster = this.monsters.getRandom(0, 7); // don't choose boss
        enemySound = this.sound.add('enemySound', 0.7, false)
        enemySound.play()
        this.currentMonster.position.set(this.game.world.centerX + 100, this.game.world.centerY + 50);

        this.monsterInfoUI = this.game.add.group();
        this.monsterInfoUI.position.setTo(this.currentMonster.x - 220, this.currentMonster.y + 120);
        this.monsterNameText = this.monsterInfoUI.addChild(this.game.add.text(0, 0, this.currentMonster.details.name, {
            font: '32px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        }));
        this.monsterHealthText = this.monsterInfoUI.addChild(this.game.add.text(0, 80, this.currentMonster.health + ' HP', {
            font: '32px Arial Black',
            fill: '#ff0000',
            strokeThickness: 4
        }));

        this.dmgTextPool = this.add.group();
        var dmgText;
        for (var d=0; d<50; d++) {
            dmgText = this.add.text(0, 0, '1', {
                font: '64px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            });
            // start out not existing, so we don't draw it yet
            dmgText.exists = false;
            dmgText.tween = game.add.tween(dmgText)
                .to({
                    alpha: 0,
                    y: 100,
                    x: this.game.rnd.integerInRange(100, 700)
                }, 1000, Phaser.Easing.Cubic.Out);

            dmgText.tween.onComplete.add(function(text, tween) {
                text.kill();
            });
            this.dmgTextPool.add(dmgText);
        }

        // create a pool of gold coins
        this.coins = this.add.group();
        this.coins.createMultiple(50, 'gold_coin', '', false);
        this.coins.setAll('inputEnabled', true);
        this.coins.setAll('goldValue', 1);
        this.coins.callAll('events.onInputDown.add', 'events.onInputDown', this.onClickCoin, this);

        this.playerGoldText = this.add.text(30, 30, 'Knowledge: ' + this.player.gold, {
            font: '24px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        });

        // 100ms 10x a second
        this.dpsTimer = this.game.time.events.loop(100, this.onDPS, this);

        // setup the world progression display
        this.levelUI = this.game.add.group();
        this.levelUI.position.setTo(this.game.world.centerX, 30);
        this.levelText = this.levelUI.addChild(this.game.add.text(0, 0, 'Expertise level: ' + this.level, {
            font: '24px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        }));
        this.levelKillsText = this.levelUI.addChild(this.game.add.text(0, 30, 'Academic achievements: ' + this.levelKills + '/' + this.levelKillsRequired, {
            font: '24px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        }));
    },
    onDPS: function() {
        if (this.player.dps > 0) {
            if (this.currentMonster && this.currentMonster.alive) {
                var dmg = this.player.dps / 10;
                this.currentMonster.damage(dmg);
                // update the health text
                this.monsterHealthText.text = this.currentMonster.alive ? Math.round(this.currentMonster.health) + ' HP' : 'LEARNED';
            }
        }
    },
    onUpgradeButtonClick: function(button, pointer) {
        // make this a function so that it updates after we buy
        function getAdjustedCost() {
            return Math.ceil(button.details.cost + (button.details.level * 1.80));
        }

        if (this.player.gold - getAdjustedCost() >= 0) {
            this.player.gold -= getAdjustedCost();
            this.playerGoldText.text = 'Knowledge: ' + this.player.gold;
            button.details.level++;
            button.text.text = button.details.name + ': ' + button.details.level;
            button.costText.text = 'Cost: ' + getAdjustedCost();
            button.details.purchaseHandler.call(this, button, this.player);
        }
    },
    onClickCoin: function(coin) {
        if (!coin.alive) {
            return;
        }
        // give the player gold
        this.player.gold += coin.goldValue;
        // update UI
        this.playerGoldText.text = 'Knowledge: ' + this.player.gold;
        // remove the coin
        coin.kill();
    },
    onKilledMonster: function(monster) {
        // move the monster off screen again
        monster.position.set(1000, this.game.world.centerY);

        var coin;
        // spawn a coin on the ground
        coin = this.coins.getFirstExists(false);
        coin.reset(this.game.world.centerX + this.game.rnd.integerInRange(-100, 100), this.game.world.centerY);
        coin.goldValue = Math.round(this.level * 1.11);
        this.game.time.events.add(Phaser.Timer.SECOND * 3, this.onClickCoin, this, coin);

        this.levelKills++;

        if (this.levelKills >= this.levelKillsRequired) {
            this.level++;
            this.levelKills = 0;
            theme.resume();
        }

        this.levelText.text = 'Expertise level: ' + this.level;
        this.levelKillsText.text = 'Academic achievements: ' + this.levelKills + '/' + this.levelKillsRequired;
        // bossTheme = this.sound.add('bossTheme', 0.4, true);

        // pick a new monster
        if (this.levelKills == this.levelKillsRequired - 1) {   // BOSS FIGHT!
            this.currentMonster = this.monsters.getAt(9);
            bossSound = this.sound.add('bossSound', 0.8, false);
            theme.pause();
            bossSound.play()
            bossTheme.play();
        }
        else { 
            bossTheme.pause();
            this.currentMonster = this.monsters.getRandom(0, 9); 
            enemySound = this.sound.add('enemySound', 0.5, false);
            enemySound.play();
        }
        // upgrade the monster based on level
        this.currentMonster.maxHealth = Math.ceil(this.currentMonster.details.maxHealth + ((this.level - 1) * 20.0));
        // make sure they are fully healed
        this.currentMonster.revive(this.currentMonster.maxHealth);
    },
    onRevivedMonster: function(monster) {
        monster.position.set(this.game.world.centerX + 100, this.game.world.centerY + 50);
        // update the text display
        this.monsterNameText.text = monster.details.name;
        this.monsterHealthText.text = monster.health + 'HP';
    },
    onClickMonster: function(monster, pointer) {
        clickSound = this.sound.add('clickSound', 0.1, false);
        clickSound.play();
        
        // apply click damage to monster
        this.currentMonster.damage(this.player.clickDmg);

        // grab a damage text from the pool to display what happened
        var dmgText = this.dmgTextPool.getFirstExists(false);
        if (dmgText) {
            dmgText.text = this.player.clickDmg;
            dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
            dmgText.alpha = 1;
            dmgText.tween.start();
        }

        // update the health text
        this.monsterHealthText.text = this.currentMonster.alive ? this.currentMonster.health + ' HP' : 'LEARNT';
    }
});

game.state.start('play');
