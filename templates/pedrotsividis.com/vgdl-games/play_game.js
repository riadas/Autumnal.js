// Post requests

/**
 * @fileoverview
 * Draw lines, polygons, circles, etc on the screen.
 * Render text in a certain font to the screen.
 */
var gamejs = require('gamejs');;
var vgdl_parser = VGDLParser(gamejs);


var retry_game = function () {
	// $('body').addClass('loading')
	location.reload();
}

var return_to_games = function () {
  localStorage.setItem("game_name", "aliens-button");
  retry_game();
}

var go_back = function () {
	window.location.href = '../..';
}


var continue_game = function () {
	game.paused = true;
	// window.location.href = `./games/${}`
}


var next_level = function () {
	window.location.href = `../../games/${data.real}/${data.pair+1}`
}

var prev_level = function () {
	window.location.href = `../../games/${data.real}/${data.pair-1}`
}

$(document).on('click', '#return', return_to_games);
$(document).on('click', '#retry', retry_game);
$(document).on('click', '#continue', continue_game);

$(document).on('click', '#next', next_level);
$(document).on('click', '#prev', prev_level);
$(document).on('click', '.example-button', function() {
  $('.example-button').removeClass("active");
  $(this).addClass("active");
  id = $(this).attr('id');
  console.log("ID: "+id);
  localStorage.setItem("game_name", id);

  switch_game(id);
});



$(document).on('click', '#pause', function () {
  game.paused = !game.paused;
  $("#return").css({"display":"block"});
  $("#retry").css({"display":"block"});
  $("#header").css({ "pointer-events": "none"});
  $(".example-button").css({"color": "gray"});

  if (game.paused) {
    $("#pause").text("Continue");
    $("#save").css({"display":"block"});
  } else {
    $("#pause").text("Pause");
    $("#save").css({"display":"none"});
  }
  $("#pause").blur();
})

var game;


var aliens_game = {level: `1.............................
000...........................
000...........................
..............................
..............................
..............................
..............................
....000......000000.....000...
...00000....00000000...00000..
...0...0....00....00...00000..
................A.............`,
                         game : `BasicGame
    SpriteSet
        base    > Immovable    color=MPUYEI
        avatar  > FlakAvatar   stype=sam color=DARKBLUE
        sam  > Missile orientation=UP    color=PINK singleton=True
        bomb > Missile orientation=DOWN  color=RED  speed=0.5
        alienGreen > Bomber stype=bomb cooldown=3 prob=.01 speed=0.6 color=LIGHTGREEN
        alienBlue > Bomber stype=bomb cooldown=3 prob=.01 speed=0.6 color=GOLD
        portalSlow  > SpawnPoint stype=alienBlue  cooldown=16  total=20 color=ORANGE 
        portalFast  > SpawnPoint invisible=True hidden=True stype=alienGreen  cooldown=12   total=20 color=LIGHTGRAY

    LevelMapping
        0 > base
        1 > portalSlow
        2 > portalFast

    TerminationSet
        SpriteCounter      stype=avatar               limit=0 win=False
        MultiSpriteCounter stype1=portalSlow stype2=portalFast stype3=alienGreen stype4=alienBlue limit=0 win=True bonus=10
	Timeout limit=2000 win=False

    InteractionSet
        avatar  EOS  > stepBack
        alienGreen   EOS  > turnAround
        alienBlue   EOS  > turnAround
        sam EOS  > killSprite
        bomb EOS  > killSprite

        base bomb > killSprite
        bomb base > killSprite
        base sam > killSprite 
        base sam > scoreChange value=1
        sam base > killSprite

        base   alienBlue > killSprite
        base   alienGreen > killSprite
        avatar alienBlue > killSprite 
        avatar alienBlue > scoreChange value=-1
        avatar alienGreen > killSprite 
        avatar alienGreen > scoreChange value=-1
	alienGreen sam > scoreChange value=2
	alienBlue sam > scoreChange value=2
        avatar bomb  > killSprite 
        avatar bomb > scoreChange value=-1
        alienGreen  sam   > killSprite 
        alienBlue  sam   > killSprite 

        sam avatar > nothing
        sam portalSlow > nothing
        sam portalFast > nothing
        alienGreen alienGreen > nothing
        alienGreen alienBlue > nothing
        alienBlue alienGreen > nothing
        alienBlue alienBlue > nothing`};


var exp_id = '0';
var data = {};
data.real = 'gvgai_aliens';
data.name = 'Aliens';
data.desc = 0;
data.level = 0;
data.pair = 0;
data.next = true;

var show_score = true;

var on_game_end;
var begin_game;

var vgdl_game;
var user_id;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

$(document).ready(function () {
  const host = "http://localhost:5000";
  // const host = "https://vgdl-experiment.herokuapp.com";
  var game_name = localStorage.getItem("game_name");
  user_id = localStorage.getItem("user_id");
  console.log("GAME_NAME? "+game_name);
  if (game_name == null) {
    vgdl_game = aliens_game;
  } else {
    $('.example-button').removeClass("active");
    $("#"+game_name).addClass("active");  
    switch_game(game_name);
  }

  if (user_id == null) {
    user_id = getRandomInt(1, 10000);
    localStorage.setItem("user_id", ""+user_id);
  } else {
    user_id = parseInt(user_id);
  }

  game = vgdl_parser.playGame(vgdl_game.game, vgdl_game.level, 0);

	var retry_container = $('<div id="retry-div" class="Flex-Container"></div>');
	var retry_text = $('<p id="retry-text">If you get stuck, you can press "Retry" to reset this level. Also, remember that spacebar may be used.</p>')
	var retry_button = $('<button id="retry">Retry</button>')
	retry_container.append(retry_text)
	retry_container.append(retry_button)

	var end_game_delay = 1000
	var ended = false;

	if (show_score) {
		var score_container = $('<h2 id="score">Score: <span id="score-value">0</span></h2>');
		$('#game-body').prepend(score_container)
	}
	on_game_end = function () {
		game.paused = true;
		ended = true
		// $('#retry-div').remove()
		if (game.win) {
			$('#title').text('Game Won!')
			//var score_container = $('<h2 id="score">Score: <span id="score-value">0</span></h2>');
			//$('#game-body').prepend(score_container)
		} else {
      $('#title').text('Game Lost!');
			//var score_container = $('<h2 id="score">Score: <span id="score-value">0</span></h2>');
			//$('#game-body').prepend(score_container)
    }
    $("#pause").remove();
    $("#save").css({"display":"block"});
    $("#retry").css({"display":"block"});
    $("#return").css({"display":"block"});
	}

	begin_game = function () {

		$('#start').remove();
		game.paused = false;

  }
  
  save = function () {
    console.log("SAVE!")

    var canvas = document.getElementById('gjs-canvas');
    var width = canvas.width;
    var height = canvas.height;

    var user_events = [];
    for (const obs of game.history) {
      user_events.push(obs["actions"])
    }

    console.log("user_events");
    console.log(user_events);

    history_json = { "history" : game.history, "user_events": user_events, "game_name" : data.name, "grid_size" : [width, height] };
    console.log(history_json);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", host + '/users/' + user_id, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () { // Call a function when the state changes.
      if (this.readyState === 4 && this.status === 200) {
        console.log("SAVED!");
      }
    };

    xhr.send(JSON.stringify(history_json));
  }

  $(document).on('click', '#save', save);



	$('#gjs-canvas').focus();
	$('#start').click(begin_game)

	game.paused = true;
	gamejs.ready(game.run(on_game_end));
	
});

// // gamejs.ready will call your main function
// // once all components and resources are ready.
// gamejs.ready(main);

var jaws_game = {level: `.....................
..........A..........
....................1
2....................
....................1
2....................
....................1
2....................
..........3..........
`,
                         game : `BasicGame
    SpriteSet
        sharkhole  > SpawnPoint color=LKLWDD stype=shark  prob=0.025 total=1  
        whalehole  > SpawnPoint color=DLLJEV stype=whale  prob=0.1 cooldown=10 
        piranhahole  >  SpawnPoint color=GREEN stype=piranha  prob=0.1 cooldown=10  


        avatar  > ShootAvatar color=DARKBLUE  stype=torpedo 
        torpedo > Missile color=WHITE  
        shark  > Chaser speed=0.1 cooldown=2 color=ORANGE  stype=avatar
        whale  > Missile  orientation=RIGHT  speed=0.1 color=BROWN 
        piranha > Missile orientation=LEFT speed=0.1 color=RED 

        shell > Resource color=YELLOW limit=20 
        sharkFang > Resource color=GOLD limit=1 


    LevelMapping
        1 > piranhahole
        2 > whalehole
        3 > sharkhole
        A > avatar

    TerminationSet
        SpriteCounter stype=avatar limit=0 win=False
        Timeout limit=500 win=True bonus=0.02

    InteractionSet
        EOS avatar > stepBack
        avatar EOS > stepBack
	EOS shark > stepBack
        EOS torpedo  > killSprite

	EOS shark > killSprite
        EOS whale > killSprite
        EOS piranha > killSprite

        torpedo shark > killSprite
        torpedo whale > killSprite
        torpedo piranha > killSprite

	whale torpedo > scoreChange value=1
        whale torpedo > transformTo stype=shell 
	
	piranha torpedo > scoreChange value=1
        piranha torpedo > transformTo stype=shell 
	

        sharkFang avatar > collectResource 
	sharkFang avatar > scoreChange value=1000
        shell avatar > collectResource 
	shell avatar > scoreChange value=1

        avatar shark > spawnIfHasMore resource=shell limit=15 stype=sharkFang
        shark avatar > killIfOtherHasMore resource=shell limit=15

        avatar shark  > killIfHasLess resource=shell limit=15
        avatar whale  > killSprite
	avatar piranha > killSprite`};

var zelda_game = {level: `wwwwwwwwwwwww
wA.......w..w
w..w........w
w...w...w.+ww
www.w2..wwwww
w.......w.g.w
w.2.........w
w.....2.....w
wwwwwwwwwwwww`,
                         game : `BasicGame
  SpriteSet
    goal  > Immovable color=GREEN
    key   > Resource color=ORANGE limit=1
    sword > OrientedFlicker singleton=True color=WHITE
    avatar  > ShootAvatar   stype=sword frameRate=8 color=DARKBLUE
    enemy >
      monsterQuick > RandomNPC cooldown=6 cons=6 color=BROWN
      monsterNormal > RandomNPC cooldown=8 cons=8 color=PINK
      monsterSlow > RandomNPC cooldown=10 cons=12 color=GOLD
    wall > Immovable autotiling=true color=DARKGRAY


  LevelMapping
    g > goal
    + > key
    1 > monsterQuick
    2 > monsterNormal
    3 > monsterSlow
    w > wall


  InteractionSet
    avatar wall  > stepBack
    avatar goal    > nothing
    goal avatar  > killIfOtherHasMore resource=key limit=1
    monsterSlow sword > killSprite
    monsterQuick sword > killSprite
    monsterNormal sword > killSprite
    monsterSlow sword > scoreChange value=2
    monsterQuick sword > scoreChange value=2
    monsterNormal sword > scoreChange value=2

    monsterSlow monsterSlow > stepBack
    monsterSlow monsterQuick > stepBack
    monsterSlow monsterNormal > stepBack
    monsterQuick monsterNormal > stepBack
    monsterNormal monsterNormal > stepBack
    monsterQuick monsterQuick > stepBack

    avatar monsterSlow > killSprite
    avatar monsterQuick > killSprite
    avatar monsterNormal > killSprite
    avatar monsterSlow > scoreChange value=-1
    avatar monsterQuick > scoreChange value=-1
    avatar monsterNormal > scoreChange value=-1

    avatar key   > changeResource resource=key value=1
    avatar key   > scoreChange value=1
    key avatar    > killSprite

    monsterQuick wall > stepBack
    monsterNormal wall > stepBack
    monsterSlow wall > stepBack

    monsterSlow key > nothing
    monsterQuick key > nothing
    monsterNormal key > nothing

    sword goal > nothing
    sword key > nothing
    sword wall > nothing
    sword avatar > nothing
    sword sword > nothing

  TerminationSet
    Timeout limit=2000 win=False
    SpriteCounter stype=goal   win=True bonus=10
    SpriteCounter stype=avatar win=False`};

var watergame_game = {level: `wwwwwww
wwowAww
wwx...w
wwwcc.w
ww...ww
wwwwwww`,
                         game : `BasicGame
    SpriteSet
        background > Immovable color=WHITE
        door > Passive color=BROWN
        wall > Immovable color=DARKGRAY
        water > Immovable color=LIGHTBLUE
        box > Passive color=PURPLE
        avatar > MovingAvatar color=DARKBLUE
    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=door limit=0 win=True bonus=10
        SpriteCounter stype=avatar limit=0 win=False
    InteractionSet
        avatar wall > stepBack
        box avatar > bounceForward
        box wall > stepBack
        box box > stepBack
        wall box > stepBack
        water box > killSprite
        box water > killSprite
        avatar water > killSprite
        door avatar > killSprite

    LevelMapping
        A > background avatar
        w > wall
        x > background water
        c > background box
        o > background door
        . > background`};

var survivezombies_game = {level: `wwwwwwwwwwwwwwwwwww
wA++.++++++++..++1w
w.+.+++++++++..++0w
wwwww++++++++wwwwww
w+++++w+..+++++w1.w
w+0+-+wwwwwww++++ww
w++.++++++++++++++w
wwwww+++++www+++++w
w++1w+++++++++++++w
w++++++++...+0++www
wwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame
    SpriteSet
        honey  > Resource color=GOLD limit=10
        moving >
            avatar > MovingAvatar frameRate=8 color=DARKBLUE
            bee    > RandomNPC speed=1   cooldown=3  color=LIGHTBLUE
	    zombiesuperclass> color=WHITE
	            zombie > Chaser stype=avatar cooldown=6 speed=0.5
           	 dying_zombie > Chaser stype=avatar cooldown=6 speed=0.5
        flower > SpawnPoint stype=bee    prob=0.02 color=PINK
        hell   >
            fastHell   > SpawnPoint stype=zombie prob=0.05 color=GREEN
            slowHell   > SpawnPoint stype=zombie prob=0.03 color=RED
        wall > Immovable autotiling=true color=DARKGRAY

    InteractionSet
        honey avatar    > collectResource
        honey avatar    > changeScore value=1
        honey avatar    > killSprite

        avatar wall     > stepBack
        bee wall > stepBack
        zombie wall > stepBack

        avatar zombie   > killIfHasLess resource=honey limit=1
        avatar zombie   > scoreChange value=-1
        avatar zombie   > changeResource resource=honey value=-1
        zombie avatar   > killSprite

        zombie bee          > transformTo stype=dying_zombie
        bee dying_zombie    > transformTo stype=honey
        dying_zombie honey  > killSprite
        avatar slowHell     > changeScore value=-1
        avatar fastHell     > changeScore value=-1
        avatar slowHell     > killSprite
        avatar fastHell     > killSprite

        avatar bee > nothing
        avatar flower > nothing
        zombie flower > nothing
        bee flower > nothing

        zombie slowHell > nothing
        zombie fastHell > nothing

        honey zombie > nothing
        honey bee > nothing
        honey flower > nothing
        honey slowHell > nothing
        honey fastHell > nothing

    TerminationSet
        Timeout limit=500 win=True bonus=0.02
        SpriteCounter stype=avatar limit=0 win=False

    LevelMapping
        0 > flower
        1 > slowHell
        2 > fastHell
        . > honey
        - > zombie
        w > wall`};

var surprise_game = {level: `wwwwwwwwwwwww
wA w    i   w
w  w        w
w  w   o    w
w   i       w
w          aw
wwwwwwwwwwwww`,
                         game : `BasicGame
    SpriteSet
        
        annoyed > RandomNPC speed=0.2 color=PURPLE
        fence > Immovable color=SCJPNE        
        citizen > 
            quiet > RandomNPC speed=0.6 color=GREEN
	    avatar > MovingAvatar color=DARKBLUE
        wand > Flicker limit=5 color=LIGHTBLUE
        george > Chaser color=YELLOW stype=quiet speed=0.1
        inert > Immovable color=MPUYEI
        apple > Immovable color=RED
        ogate > Immovable color=NUPHKK
        wall > Immovable color=DARKGRAY

    TerminationSet
        SpriteCounter stype=avatar  win=False
        SpriteCounter stype=apple   win=True bonus=10
        Timeout limit=2000 win=False

    InteractionSet
        ogate avatar > nothing
        avatar ogate > nothing
        ogate apple > nothing
        apple ogate > nothing
        ogate quiet > transformTo stype=quiet
        quiet ogate > nothing
        apple avatar > killSprite
        avatar apple > nothing
        inert avatar > transformTo stype=quiet
        wand inert > nothing
        wand quiet > nothing
        quiet wand > nothing
        avatar inert > nothing
        wand wall > nothing
        wall wand > nothing
        wand apple > nothing
        apple wand > nothing
        wand ogate > nothing
        ogate wand > nothing
        wand fence > nothing
        fence wand > nothing
        quiet apple > stepBack
        apple quiet > stepBack
        quiet fence > nothing
        fence quiet > nothing
        avatar fence > stepBack
        fence avatar > nothing
        quiet george > transformTo stype=annoyed
        avatar george > killSprite 
        avatar george > changeScore value=-1
        avatar quiet > nothing

        annoyed wall > stepBack
        quiet wall > stepBack
        quiet EOS > stepBack
        avatar wall > stepBack

        annoyed annoyed > nothing
        annoyed quiet > nothing
        annoyed avatar > nothing
        annoyed george > nothing
        annoyed EOS > nothing
        quiet annoyed > nothing
        quiet quiet > stepBack
        quiet avatar > nothing
        quiet EOS > nothing
        avatar annoyed > nothing
        avatar avatar > nothing
        avatar EOS > nothing
        george annoyed > nothing
        george quiet > nothing
        george avatar > nothing
        george george > nothing
        george wall > nothing
        george EOS > nothing
        wall annoyed > nothing
        wall quiet > nothing
        wall avatar > nothing
        wall george > nothing
        wall wall > nothing
        wall EOS > nothing
        EOS annoyed > nothing
        EOS quiet > nothing
        EOS avatar > nothing
        EOS george > nothing
        EOS wall > nothing
        EOS EOS > nothing


    LevelMapping
        f > fence
        g >  george
        c >  quiet
        o > ogate
        A >  avatar
        a > apple
        i > inert
        w > wall`};

var sokoban_game = {level: `wwwwwwwwwwwww
w........w..w
w...1.......w
w...A.1.w.0ww
www.w1..wwwww
w.......w.0.w
w.1........ww
w..........ww
wwwwwwwwwwwww`,
                         game : `BasicGame square_size=20
    SpriteSet
        hole   > Immovable color=RED
        avatar > MovingAvatar color=DARKBLUE
        box    > Passive color=GREEN
        wall > Immovable color=DARKGRAY autotiling=True
    LevelMapping
        0 > hole
        1 > box
        w > wall
    InteractionSet
        avatar wall > stepBack
        box avatar  > bounceForward
        box wall > stepBack
        box box > stepBack
        avatar hole > nothing
        box hole    > killSprite
	box hole > scoreChange value=1
    TerminationSet
        SpriteCounter stype=box    limit=0 win=True bonus=10
        Timeout limit=2000 win=False`};

var relational_game = {level: `wwwwwwwwwwwwwwwwwwwwww
wfA       w         fw
w    a    x          w
w              f     w
w w         w        w
w      f             w
w              w  x  w
w   w      a         w
wf                  fw
wwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame frame_rate=30
    SpriteSet
        probe > Immovable color=BLUE
        converter > Immovable
            converter1 > color=RED
            converter2 > color=PURPLE
            converter3 > color=PINK
        box > Immovable
            box1 > color=ORANGE
        fire > Immovable color=YELLOW
        avatar > MovingAvatar color=WHITE
        poison > Immovable color=BLACK
        wall > Immovable color=DARKGRAY
    LevelMapping
        w > wall
        a > box1
        b > box2
        f > fire
        x > probe
        e > converter1
        z > converter3
        y > converter2
        p > poison
    InteractionSet
        avatar wall > stepBack
        avatar fire > stepBack
        box avatar > bounceForward
        box probe > stepBack
        probe box > stepBack
        box box > stepBack
        box wall > stepBack
        probe wall > stepBack
        converter wall > stepBack
        probe converter > stepBack
        converter1 box > bounceForward
        converter1 avatar > transformTo stype=fire
        box converter2 > transformTo stype=fire
        converter2 fire > killSprite
        box fire > stepBack
        probe probe > stepBack
        probe avatar > bounceForward
        converter3 avatar > transformTo stype=box1
        probe fire > killSprite
        fire probe > killSprite
        avatar converter > nothing
        avatar poison > killSprite
    TerminationSet
        SpriteCounter stype=avatar  limit=0 win=False
        SpriteCounter stype=probe limit=0 win=True bonus=10
        Timeout limit=2000 win=False
`};

var pushboulders_game = {level: `wwwwwwwwwwwwwwwwwwwwww
w  1    p            w
w    2    p          w
wA  q     2   w     ww
w    w1       w w    w
ww          q        w
w   p    q      1    w
w    2        g      w
w         2          w
wwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame frame_rate=30
    SpriteSet
        avatar > MovingAvatar color=DARKBLUE
        goal > ResourcePack color=GOLD
	poison > ResourcePack
        	poison1 > color=ORANGE
        	poison2 > color=PINK
        box1 > ResourcePack color=GREEN
        box2 > ResourcePack color=LIGHTBLUE
        wall > Immovable color=DARKGRAY
    LevelMapping
        p > poison1
        q > poison2
        1 > box1
        2 > box2
        w > wall
        g > goal
    InteractionSet
        avatar wall > stepBack
        avatar poison1 > killSprite
        avatar poison2 > killSprite
        goal avatar > killSprite
        box1 avatar > bounceForward
        box2 avatar  > killSprite
	box2 box1 > killSprite
        poison wall > stepBack
        goal box1 > killSprite
        box2 goal > stepBack
        goal wall > stepBack
        goal poison1 > stepBack
        goal poison2 > stepBack
        box1 wall    > stepBack
        box1 box2    > nothing
        box2 wall    > stepBack
        box1 box1 > stepBack
        poison1 box1 > killSprite
        poison2 box1 > bounceForward
	poison2 box1 > stepBack
        poison1 box2 > stepBack
	poison2 poison2 > stepBack
        poison2 box2 >stepBack
    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=goal    limit=0 win=True bonus=10
        SpriteCounter stype=avatar  limit=0 win=False`};

var preconditions_game = {level: `wwwwwwwwwwwwwwwwww
w                w
w     A          w
w                w
w                w
w                w
w  b             w
w                w
w             g  w
wwwwwwwwwwwwwwwwww`,
                         game : `BasicGame frame_rate=30
    SpriteSet
        avatar > MovingAvatar color=DARKBLUE
        goal > Passive color=GOLD
        box > Passive color=ORANGE
        medicine > Resource limit=4 color=WHITE
        poison > Resource limit=3 color=RED
        suit > Resource limit=1 color=GREEN
        wall > Immovable color=BLACK
    LevelMapping
        0 > hole
        b > box
        m > medicine
        p > poison
        s > suit
        w > wall
        g > goal
    InteractionSet
        avatar wall > stepBack
        medicine avatar > killSprite
        avatar poison > killIfHasLess resource=medicine limit=0
        avatar poison > changeResource resource=medicine value=-1
        avatar medicine > changeResource resource=medicine value=1
        box avatar > killSprite
        poison avatar > killSprite
        goal avatar > killSprite
    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=avatar  limit=0 win=False
        SpriteCounter stype=goal limit=0 win=True bonus=10`};

var portals_game = {level: `wwwwwwwwwwwwwwwwwww
wA++w++v++h++w3++gw
wo+iw++++++++wx+++w
wwwww++++++o+wwwwww
w+++++w+r++++++w+ow
w+h+++wwwwwww++++ww
w++r+++x+++++h++++w
wwwww+++++www+++++w
w+++++++++i+++++++w
www2w+++v++++x++www
wwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame
    SpriteSet

        bullet >
            sitting  > Immovable color=LIGHTGREEN
            random   > RandomNPC speed=0.25 cons=1 color=BROWN
            straight > Missile   speed=0.5
                vertical   > orientation=UP color=PINK
                horizontal > orientation=LEFT color=LIGHTRED
        structure > Immovable
            goal  > color=GREEN
            portalentry > Portal
                entry1 > stype=exit1 color=LIGHTBLUE
                entry2 > stype=exit2 color=BLUE
            portalexit  >
                exit1  > color=ORANGE
                exit2  > color=LIGHTORANGE
        avatar > MovingAvatar color=DARKBLUE
        wall > Immovable color=BLACK 
    InteractionSet
        random wall > stepBack
        random goal > stepBack
        random exit1 > stepBack
        random exit2 > stepBack
        random entry1 > stepBack
        random entry2 > stepBack

        horizontal goal > stepBack
        horizontal exit1 > nothing
        horizontal exit2 > nothing
        horizontal entry1 > nothing
        horizontal entry2 > nothing

        vertical goal > stepBack
        vertical exit1 > nothing
        vertical exit2 > nothing
        vertical entry1 > nothing
        vertical entry2 > nothing

        sitting wall > stepBack
        sitting  goal > stepBack
        sitting exit1 > stepBack
        sitting exit2 > stepBack
        sitting entry1 > stepBack
        sitting entry2 > stepBack

        sitting random > nothing
        sitting horizontal > nothing
        sitting vertical > nothing
        random horizontal > nothing
        random vertical > nothing
        random random > nothing
        horizontal vertical > nothing
        horizontal horizontal > nothing
        vertical vertical > nothing

        avatar wall      > stepBack
	goal avatar > changeScore value=1
        goal   avatar    > killSprite
        avatar sitting    > killSprite
        avatar random    > killSprite
        avatar vertical    > killSprite
        avatar horizontal    > killSprite
        vertical wall    > reverseDirection
        horizontal wall    > reverseDirection
        avatar entry1 > teleportToExit
        avatar exit1 > nothing
        avatar entry2 > teleportToExit
        avatar exit2 > nothing

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=goal   limit=0 win=True bonus=10
        SpriteCounter stype=avatar limit=0 win=False

    LevelMapping
        h > horizontal
        v > vertical
        x > sitting
        r > random
        g > goal
        i > entry1
        2 > entry2
        o > exit1
        3 > exit2
        w > wall`};

var plaqueattack_game = {level: `wwwwwwwwwwwwwwwwwwwwwwww
wwwwwwwwdwwwdwwwdwwwwwww
wwwwwwww.www.www.wwwwwww
wwwwwwww.www.www.wwwwwww
wd...www.www.www.www..dw
wwww.www.www.www.www..ww
w......................w
w......................w
w......................w
w......................w
w......................w
w......................w
w......................w
w......................w
w......................w
w......................w
w...........A..........w
w......................w
w...m...m...m...m...m..w
wwwwwwwwwwwwwwwwwwwwwwww
wwwwwwwwwwwwwwwwwwwwwwww
wwwwwwwwwwwwwwwwwwwwwwww
`,
                         game : `BasicGame square_size=25
  SpriteSet
    floor > Immovable color=WHITE
    fullMolarInf > Immovable color=YELLOW
    fullMolarSup > Immovable color=RED
    deadMolarInf > Immovable color=GREEN
    deadMolarSup > Immovable color=BLUE

    avatar  > ShootAvatar stype=fluor color=DARKBLUE frameRate=8
    hotdog > Chaser speed=1 cooldown=10 stype=fullMolarInf color=ORANGE
    burger > Chaser speed=1 cooldown=10 stype=fullMolarSup color=BROWN

    hotdoghole > SpawnPoint color=LIGHTGRAY  stype=hotdog  prob=0.15 cooldown=8 total=5 color=PURPLE
    burgerhole > SpawnPoint color=LIGHTBLUE stype=burger  prob=0.15 cooldown=8 total=5 color=PINK

    fluor > Missile color=LIGHTRED
    wall > Immovable color=GRAY


  LevelMapping
    h > hotdog floor
    d > hotdoghole floor
    b > burger floor
    v > burgerhole floor
    n > fullMolarSup floor
    m > fullMolarInf floor
    . > floor
    A > avatar floor

  InteractionSet
    avatar wall > stepBack
    hotdog wall > stepBack
    burger wall > stepBack

    fluor hotdog > scoreChange value=1
    fluor hotdog > killSprite

    hotdog fluor  > scoreChange value=1
    hotdog fluor   > killSprite 
    
    fluor burger > scoreChange value=1
    fluor burger > killSprite
    
    burger fluor  > scoreChange value=1
    burger fluor   > killSprite
    
    fluor wall   > killSprite

    fullMolarInf hotdog > scoreChange value=-3 
    hotdog fullMolarInf > killSprite
    fullMolarInf hotdog > transformTo stype=deadMolarInf
    
    fullMolarInf burger > scoreChange value=-3
    burger fullMolarInf > killSprite
    fullMolarInf burger > transformTo stype=deadMolarInf
    
    deadMolarInf avatar > scoreChange value=1
    deadMolarInf avatar > transformTo stype=fullMolarInf
    
    fullMolarSup hotdog > scoreChange value=-3
    hotdog fullMolarSup > killSprite
    fullMolarSup hotdog > transformTo stype=deadMolarSup
    
    fullMolarSup burger > scoreChange value=-3
    burger fullMolarSup > killSprite
    fullMolarSup burger > transformTo stype=deadMolarSup
    
    deadMolarSup avatar > scoreChange value=1
    deadMolarSup avatar > transformTo stype=fullMolarSup
    

  TerminationSet
    Timeout limit=2000 win=False
    MultiSpriteCounter stype1=fullMolarInf stype2=fullMolarSup limit=0 win=False
    MultiSpriteCounter stype1=hotdoghole stype2=hotdog stype3=burger stype4=burgerhole limit=0 win=True bonus=10`};

var myaliens_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
w112112112112112112112112112111w
w                              w
w                              w
w                              w
w                              w
w                              w
w                              w
w                              w
w                              w
w                              w
w                              w
w               A              w
wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
`,
                         game : `BasicGame
    SpriteSet
        base    > Immovable    color=WHITE 
        avatar  > HorizontalAvatar color=SQYLIY
        alien   > Missile  orientation=DOWN  speed=0.8 color=ORANGE
        ghost > Missile orientation=DOWN speed=0.8 color=PURPLE
        portalAlien  > SpawnPoint orientation=RIGHT   stype=alien  color=CCKQQB cooldown=16  prob=0.08 total=20 
        portalGhost  > SpawnPoint orientation=RIGHT   stype=ghost  color=BVUTFD cooldown=12  prob=0.08 total=20 

    LevelMapping
        0 > base
        1 > portalAlien
        2 > portalGhost
        w > wall

    TerminationSet
        SpriteCounter      stype=avatar               limit=0 win=False
        Timeout limit=500 win=True bonus=0.02

    InteractionSet
        avatar  wall  > stepBack
        alien   EOS  > reverseDirection
        base   alien > killSprite

        alien avatar > scoreChange value=1
        alien avatar > killSprite 
        
	avatar ghost > scoreChange value=-10
        avatar ghost > killSprite 
        `};

var missilecommand_game = {level: `wwwwwwwwwwwwwwwwwwwwwwww
w....m.....m....m...m..w
w......................w
w......................w
w......................w
w......................w
w......................w
w...........A..........w
w......................w
w......................w
w......................w
w.....c.....c......c...w
wwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame
  SpriteSet
    city  > Immovable color=GREEN randomtiling=0.5
    explosion > Flicker limit=5 color=PINK

    avatar  > ShootAvatar stype=explosion color=DARKBLUE
    incoming_slow  > Chaser stype=city color=RED speed=0.1
    incoming_fast  > Chaser stype=city color=GOLD speed=0.3

    wall > Immovable color=DARKGRAY

  LevelMapping
    c > city
    m > incoming_slow
    f > incoming_fast
    w > wall
 

  InteractionSet
    incoming_slow wall  > stepBack
    incoming_fast wall  > stepBack
    avatar wall  > stepBack
    incoming_slow city > killSprite 
    incoming_slow city > scoreChange value=-1
    city incoming_slow > killSprite
    incoming_fast city > killSprite 
    incoming_fast city > scoreChange value=-1
    city incoming_fast > killSprite
    avatar city > nothing
    avatar explosion > nothing
    
    incoming_slow explosion > killSprite 

    incoming_slow explosion > scoreChange value=2
    incoming_fast explosion > killSprite
   
    incoming_fast explostion > scoreChange value=2

    explosion explosion > nothing
    explosion wall > nothing
    city explosion > nothing
    incoming_fast incoming_fast > nothing
    incoming_fast incoming_slow > nothing
    incoming_slow incoming_slow > nothing
    avatar incoming_fast > nothing
    avatar incoming_slow > nothing

  TerminationSet
    Timeout limit=2000 win=False
    SpriteCounter stype=city   win=False
    MultiSpriteCounter stype1=incoming_slow stype2=incoming_fast limit=0 win=True bonus=10
    #SpriteCounter stype=incoming win=True`};

var lemmings_game = {level: `wwwwwwwwwwwwwwwwwwwww
w.....ww..wwwwww....w
w.....ww.hhh..hww...w
w..x..w..wwwwww..ww.w
w..whww.wwwwww.w....w
w..ww...wwwwwhww....w
w..ww.hwwwwwwwww....w
w.....hw..w..ww.....w
w..w..hw....wwww....w
w..A.............e..w
wwwwwwwwwwwwwwwwwwwww
`,
                         game : `BasicGame
    SpriteSet
        floor > Immovable color=LIGHTGRAY 
        hole   > Immovable color=LIGHTBLUE 
        shovel > Flicker color=BROWN limit=1 singleton=True 

        entrance > SpawnPoint total=20 cooldown=50 stype=lemming color=PURPLE 
        goal > Immovable color=GREEN 

        avatar  > ShootAvatar stype=shovel color=DARKBLUE
        lemming > Chaser  stype=goal speed=1 cooldown=5 color=RED
        wall > Immovable color=GRAY 
    LevelMapping
        x > floor goal
        e > floor entrance
        h > floor hole
        . > floor
        A > floor avatar
        w > floor wall

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter  stype=avatar  limit=0 win=False
        MultiSpriteCounter stype1=entrance stype2=lemming limit=0 win=True bonus=10

    InteractionSet
        avatar hole  > killSprite 
	avatar hole > scoreChange value=-5
        lemming hole  > killSprite 
	lemming hole > scoreChange value=-2

        avatar wall > stepBack
        lemming wall > stepBack
	avatar EOS > stepBack
        lemming EOS > stepBack
        wall shovel  > killSprite 
	wall shovel > scoreChange value=-1
        lemming goal > killSprite 
	lemming goal > scoreChange value=2
`};

var helper_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
w                              w
w                              w
w              a               w
w  x                           w
w                         a    w
w                              w
w  A                           w
www                            w
wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame frame_rate=30
    SpriteSet
        avatar > MovingAvatar color=DARKBLUE cooldown=0
        mover > VGDLSprite
            chaser > Chaser
                chaser1 > stype=box1 color=ORANGE  cooldown=12
                chaser2 > stype=box3 color=LIGHTBLUE cooldown=12
        wall > Immovable color=BLACK
        forcefield > Passive color=PURPLE
        box > Passive
            box1 > color=WHITE
            box2 > color=GREEN
            box3 > color=YELLOW
    LevelMapping
        w > wall
        a > box1
        b > box2
        c > box3
        f > forcefield
        x > chaser1
        z > chaser2
        r > rand
        z > chaser2
        1 > missile1
        2 > missile2
    InteractionSet
        avatar wall > stepBack
        mover wall > stepBack
        box wall > stepBack
        rand wall > stepBack
        box1 avatar > bounceForward
        box1 box2 > stepBack
        box1 box1 > stepBack
        avatar chaser > nothing
        box2 avatar > killSprite
        box1 chaser > killSprite
        box1 rand > killSprite
        box1 box3 > nothing
        avatar box3 > nothing
        box3 chaser > killSprite
        box2 forcefield > nothing
        rand forcefield > stepBack
        forcefield rand > stepBack
        chaser forcefield > stepBack
        avatar forcefield > nothing
        avatar rand > nothing
        chaser wall > stepBack
        chaser box2 > stepBack
        missile EOS > wrapAround
        missile avatar > killSprite
        missile missile > reverseDirection
        mover mover > stepBack
    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=avatar  limit=0 win=False
        SpriteCounter stype=box1 limit=0 win=True bonus=10`};

var frogs_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwwwww
+++++++++++w g w++++++++++++
000==000000===0000=====000=2
00000====0000000000====00012
000===000===000====0000===02
www+++ww+++www++++www++wwwww
....----...---...-..----....
.-.....xxx.......xxx....xx..
..-...---.....-...----.--...
w+++++++A++++++++++++++++++w
wwwwwwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame
    SpriteSet
        safety > Resource  limit=4
	
        forestDense > SpawnPoint stype=log prob=0.4  cooldown=10
        forestSparse > SpawnPoint stype=log prob=0.1  cooldown=5
	water > Immovable color=BLUE	
        goal  > Immovable color=GREEN
        log    > Missile   orientation=LEFT  speed=0.1 color=BROWN

	fastRtruck  > Missile   orientation=RIGHT speed=0.2  color=YELLOW img=newset/car3R
       	slowRtruck  > Missile   orientation=RIGHT speed=0.1  color=RED img=newset/car4R
        
  
	fastLtruck  > Missile   orientation=LEFT speed=0.2  color=LIGHTYELLOW img=newset/car3
        slowLtruck  > Missile   orientation=LEFT speed=0.1  color=LIGHTRED img=newset/car4

        avatar > MovingAvatar color=DARKBLUE
        wall > Immovable color=DARKGRAY

    InteractionSet
        goal avatar  > killSprite
	goal avatar > scoreChange value=1
        avatar log   > changeResource resource=safety value=1
        avatar log   > pullWithIt   # note how one collision can have multiple effects
	avatar EOS > stepBack
        avatar wall  > stepBack
        log wall > nothing
        water log > nothing
        log log > nothing
        avatar water > killIfHasLess  resource=safety limit=-1
        avatar water > changeResource resource=safety value=-1
        log    EOS   > wrapAround
        forestDense log > nothing
        forestSparse log > nothing
        forestDense water > nothing
        forestSparse water > nothing

        fastRtruck wall > nothing
        slowRtruck wall > nothing
        fastRtruck fastLtruck > nothing
        slowRtruck slowLtruck > nothing
        fastRtruck slowLtruck > nothing
        fastRtruck fastRtruck > nothing
        slowRtruck slowRtruck > nothing
        fastRtruck slowRtruck > nothing
        fastRtruck wall > nothing
        slowRtruck wall > nothing
        avatar fastRtruck > killSprite
        avatar slowRtruck > killSprite
        slowRtruck  EOS   > wrapAround
        fastRtruck  EOS   > wrapAround

        fastLtruck wall > nothing
        slowLtruck wall > nothing
        fastLtruck fastLtruck > nothing
        slowLtruck slowLtruck > nothing
        fastLtruck slowLtruck > nothing
        fastLtruck wall > nothing
        slowLtruck wall > nothing
        avatar fastLtruck > killSprite
        avatar slowLtruck > killSprite
        slowLtruck  EOS   > wrapAround
        fastLtruck  EOS   > wrapAround

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=goal   limit=0 win=True bonus=10
        SpriteCounter stype=avatar limit=0 win=False

    LevelMapping
        g > goal
        0 > water
        1 > forestDense water    # note how a single character can spawn multiple sprites
        # 1 > water       # note how a single character can spawn multiple sprites
        2 > water forestDense log
        # 2 > log
        3 > forestSparse water       # note how a single character can spawn multiple sprites
        # 3 > water       # note how a single character can spawn multiple sprites
        4 > forestSparse log
        # 4 > log
        - > slowRtruck
        x > fastRtruck
        _ > slowLtruck
        l > fastLtruck
        = > log water
        w > wall
	B > water log avatar`};

var exploreexploit_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwww
wA                       w
w                        w
w            a           w
w     a                  w
w                    a   w
w          a             w
w                        w
w                        w
wwwwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame frame_rate=30
    SpriteSet
        apple > Immovable color=GREEN
        orange > Immovable color=ORANGE
        blueberry > Immovable color=BLUE
        dough > Immovable color=YELLOW
        cranberry > Immovable color=LIGHTBLUE
        eel > Immovable color=PINK
        fruit > Immovable color=RED
        avatar > MovingAvatar color=DARKBLUE
        missile > Missile color=RED speed=.5 orientation=RIGHT
        wall > Immovable color=DARKGRAY
    LevelMapping
        w > wall
        a > apple
        b > blueberry
        o > orange
        m > missile
    InteractionSet
        avatar wall > stepBack
        apple avatar > killSprite
        blueberry avatar > killSprite
        orange avatar > killSprite
        missile orange > nothing
        missile wall > reverseDirection
    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=avatar  limit=0 win=False
        SpriteCounter stype=apple limit=0 win=True bonus=10`};

var corridor_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
wp.................................. .1w
wpA.............................g.... 3w
wp.................................. .5w
wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
`,
                         game : `BasicGame
    SpriteSet
	mover >
	        fastR > Missile speed=.8 cooldown=1 orientation=RIGHT color=BLUE
	        fastL > Missile speed=.8 cooldown=1 orientation=LEFT color=LIGHTBLUE
	        mediumR > Missile speed=.4 cooldown=1 orientation=RIGHT color=ORANGE
	        mediumL > Missile speed=.4 cooldown=1 orientation=LEFT color=LIGHTORANGE
        	slowR > Missile speed=.2 cooldown=1 orientation=RIGHT color=LIGHTGREEN
	        slowL > Missile speed=.2 cooldown=1 orientation=LEFT color=GREEN
	spawn > SpawnPoint color=DARKGRAY 
		fastRSpawn > stype=fastR cooldown=100 total=3
		fastLSpawn > stype=fastL cooldown=100 total=3
		mediumRSpawn > stype=mediumR cooldown=75 total=4
		mediumLSpawn > stype=mediumL cooldown=75 total=4
		slowRSpawn > stype=slowR cooldown=50 total=4
		slowLSpawn > stype=slowL cooldown=50 total=4
	padding > Immovable color=YELLOW
        goal  > Immovable color=LIGHTRED 
        avatar > MovingAvatar color=DARKBLUE
	bullet > Missile color=PURPLE
        wall > Immovable color=DARKGRAY  

    InteractionSet
	avatar padding > nothing
	padding avatar > nothing
	mover padding > killSprite
	padding mover > nothing
	spawn spawn > nothing
	spawn mover > nothing
	mover spawn >nothing
	spawn avatar > nothing
	avatar spawn >nothing
	mover mover > nothing
	goal mover > nothing
	mover goal > nothing
	goal avatar > killSprite
	avatar goal > nothing
	avatar wall > stepBack
	wall avatar > nothing
	goal wall > stepBack
	wall goal > stepBack
	mover wall > stepBack
	wall mover > nothing
	avatar mover > killSprite
	mover avatar > killSprite

	mediumL bullet > transformTo stype=slowL
	bullet mediumL > killSprite
	mediumR bullet > transformTo stype=slowR
	bullet mediumR > killSprite

	fastL bullet > transformTo stype=mediumL
	bullet fastL > killSprite
	fastR bullet > transformTo stype=mediumR
	bullet fastR > killSprite

	slowL bullet > transformTo stype=fastL
	bullet slowL > killSprite
	slowR bullet > transformTo stype=fastR
	bullet slowR > killSprite

	
    LevelMapping
        g > goal
        h > fastR
        n > mediumR
        t > slowR
        f > fastL
        m > mediumL
        s > slowL
	6 > fastRSpawn
	5 > fastLSpawn
	4 > mediumRSpawn
	3 > mediumLSpawn
	2 > slowRSpawn
	1 > slowLSpawn
        A > avatar
        B > avatar
	p > padding

    TerminationSet
	Timeout limit=2000 win=False 
	SpriteCounter stype=avatar win=False
	SpriteCounter stype=goal win=True bonus=10`};

var closinggates_game = {level: `wwwwwwwwwwwwwwwww
w  d        d   w
w  d        d   w
w  d        d   w
w  d        d   w
wwwdwwwwwwwwdwwww
wA              w
w               w
w               w
w               w
w              gw
wwwwwwwwuwwwwwwww
w       u       w
w       u       w
w       u       w
w       u       w
w       u       w
wwwwwwwwwwwwwwwww`,
                         game : `BasicGame
    SpriteSet
        wall > Immovable color=DARKGRAY
        avatar > MovingAvatar color=DARKBLUE
        goal > Immovable color=GREEN
        missile > Missile speed=.5 cooldown=12
            up > orientation=UP color=ORANGE
            down > orientation=DOWN color=RED
	boulder > Immovable color=BLUE
    InteractionSet
	boulder avatar > bounceForward
	missile boulder > stepBack
	boulder missile > stepBack
	boulder wall > stepBack
        avatar missile > stepBack
        missile avatar > stepBack
        avatar wall > stepBack
        missile wall > stepBack
        missile missile > stepBack
        goal avatar > killSprite

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=goal   limit=0 win=True bonus=10
        SpriteCounter stype=avatar limit=0 win=False

    LevelMapping
        g > goal
        1 > cannondown
        2 > cannonup
        d > down
        u > up
	b > boulder`};

var chase_game = {level: `wwwwwwwwwwwwwwwwwwwwwwww
w.....0................w
w......w.0....w.0......w
w...w.......0.ww.......w
w.....w............w...w
w.......0...w....0.....w
w.....w....w...w..w....w
w.......w.......w......w
w...w.....w.....w..0...w
w......0......A........w
wwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame
    SpriteSet
        carcass > Immovable color=BROWN
        goat > stype=avatar
            angry  > Chaser cooldown=8 color=GOLD
            scared > Fleeing cooldown=3 color=RED
        avatar > MovingAvatar color=DARKBLUE
        wall > Immovable color=DARKGRAY

    InteractionSet
        angry   wall   > stepBack
        scared   wall   > stepBack
        angry scared > nothing
        scared scared > nothing
        angry angry > nothing
        carcass avatar > nothing
        avatar wall    > stepBack
        avatar angry > scoreChange value=-1
        avatar  angry  > killSprite 
        angry carcass > nothing
        carcass scared > killSprite
        scared avatar > scoreChange value=1
        scared avatar  > transformTo stype=carcass
        scared carcass > transformTo stype=angry

    LevelMapping
        0 > scared
        w > wall

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=scared win=True bonus=10
        SpriteCounter stype=avatar win=False`};

var butterflies_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwwwww
w..1.....1..w...0.0.0.0w000w
w.1....................w000w
w...1...0.....A........w000w
wwwwwwwwwwww.............00w
w0..................w.....ww
w0......1..................w
w0.........wwwww....1.....0w
wwwww................w.....w
w........0.0.0.0.0...w0...0w
wwwwwwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame
    SpriteSet
        cocoon > Immovable color=GREEN
	avatar    > MovingAvatar color=DARKBLUE
        butterfly > RandomNPC speed=0.6 color=PINK cons=1 frameRate=5

        wall > Immovable color=DARKGRAY

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=butterfly win=True bonus=10
        SpriteCounter stype=cocoon    win=False

    InteractionSet
        avatar    wall   > stepBack
	butterfly  wall  > stepBack
	butterfly avatar > scoreChange value=2
        butterfly avatar > killSprite 
	
        butterfly cocoon > cloneSprite
        butterfly butterfly > nothing
        avatar cocoon > nothing
        butterfly wall > nothing
        cocoon butterfly > killSprite

    LevelMapping
        1 > butterfly
        0 > cocoon
        w > wall
	A > avatar`};

var boulderdash_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwww
w...o.xx.o......o..xoxx..w
w...oooooo........o..o...w
w....xxx.........o.oxoo.ow
wx...............oxo...oow
wwwwwwwwww........o...wxxw
wb-...co..............wxxw
w--........Ao....o....wxxw
wooo.............-....w..w
w......x....wwwwx-x.oow..w
wc--.....x..ooxxo-....w..w
w---..e..........b-----..w
wwwwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame
	SpriteSet
		wall > Immovable autotiling=true color=DARKGRAY
		sword > Flicker color=PINK limit=5 singleton=True
		exitdoor > Immovable color=GREEN
		diamond > Resource color=SCJPNE limit=10
		#moving >
		avatar  > ShootAvatar   stype=sword frameRate=8 color=DARKBLUE
			#enemy > RandomNPC cons=1 cooldown=5
		crab > RandomNPC cooldown=5 color=GOLD
        	butterfly > RandomNPC cooldown=5 color=RED
		boulder > Missile orientation=DOWN color=ORANGE speed=0.2
		dirt > Immovable color=BROWN
	LevelMapping
		e > exitdoor
		o > boulder
		. > dirt
		x > diamond
		c > crab
		b > butterfly

	InteractionSet
		dirt avatar > killSprite
		dirt sword  > killSprite
		diamond avatar > collectResource
		avatar wall > stepBack
		crab wall > stepBack
		butterfly wall > stepBack
		avatar boulder > stepBack
		crab boulder > stepBack
		butterfly boulder > stepBack
		avatar boulder > killIfFromAbove
		avatar butterfly > killSprite
		avatar crab > killSprite
		boulder dirt > stepBack
		boulder wall > stepBack
		boulder diamond > stepBack
		boulder boulder > stepBack
		crab dirt > stepBack
		butterfly dirt > stepBack
		crab butterfly > killSprite
		butterfly crab > transformTo stype=diamond
		exitdoor avatar > killIfOtherHasMore resource=diamond limit=9 
		#scoreChange value=100
		#exitdoor avatar > 
		exitdoor avatar > nothing

		sword crab > nothing
		sword butterfly > nothing
		sword boulder > nothing
		sword avatar > nothing
		sword exitdoor > nothing
		sword diamond > nothing
		sword wall > nothing

	TerminationSet
		Timeout limit=2000 win=False
		SpriteCounter stype=avatar limit=0 win=False
		SpriteCounter stype=exitdoor limit=0 win=True bonus=10`};

var beesandbirds_game = {level: `wwwwwwwwwwwwwwww
w     A        w
w              w
w          b   w
w   b          w
w       b      w
w   b          w
w              w
wwwwwwwwww   www
w              w
w              w
w  b           w
w              w
w         g    w
wwwwwwwwwwwwwwww
`,
                         game : `BasicGame
    SpriteSet
        wall > Immovable color=DARKGRAY
        avatar > MovingAvatar color=DARKBLUE
        goal > Immovable color=GREEN
        bee > RandomNPC color=YELLOW cooldown=4
        fence > Immovable color=PURPLE
        sparrow > Chaser
		sparrow1 > stype=obstacle color=LIGHTGREEN cooldown=4
		sparrow2 > stype=bee color=LIGHTRED cooldown=4
	lightfence > Immovable color=LIGHTBLUE
	obstacle > Immovable color=ORANGE
    InteractionSet
        avatar bee > killSprite
        bee avatar > killSprite
	avatar obstacle > killSprite
	obstacle avatar > nothing
	obstacle sparrow > killSprite
	bee obstacle > stepBack
	obstacle bee > nothing
	bee bee > nothing
	avatar lightfence > stepBack
	lightfence avatar > nothing
	bee lightfence > stepBack
	lightfence bee > nothing
        fence avatar > killSprite
	avatar fence > nothing
        avatar wall > stepBack
	wall avatar > nothing
        bee wall > stepBack
	wall bee > nothing
        bee fence > stepBack
	fence bee > nothing
        bee sparrow > killSprite
	sparrow bee > nothing
        sparrow fence > stepBack
	fence sparrow > nothing
	sparrow lightfence > nothing
	lightfence sparrow > nothing
        sparrow wall > stepBack
	wall sparrow > nothing
        goal avatar > killSprite
	avatar goal > nothing
	sparrow avatar > nothing
	avatar sparrow > nothing

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=goal   limit=0 win=True bonus=10
        SpriteCounter stype=avatar limit=0 win=False

    LevelMapping
        g > goal
        b > bee
        1 > sparrow1
	2 > sparrow2
        f > fence
	l > lightfence
	o > obstacle`};

var bait_game = {level: `wwwww
wgAww
ww..w
w.11w
wwk.w
wwwww`,
                         game : `BasicGame
    SpriteSet
        hole > Immovable color=BLUE
        avatar > MovingAvatar color=DARKBLUE
        mushroom > Immovable color=RED
        key > Resource color=ORANGE limit=1
        goal > Immovable color=GREEN
        box > Passive color=BROWN
        wall > Immovable color=DARKGRAY

    LevelMapping
        A > avatar 
        0 > hole 
        1 > box 
        k > key 
        g > goal 
        m > mushroom 

    InteractionSet
        avatar wall > stepBack
        avatar hole > killSprite
        box avatar > bounceForward
        box wall > stepBack
        box box > stepBack
        box mushroom > undoAll

        
        hole box > killSprite
        hole box > scoreChange value=1
        box hole > killSprite

        avatar key > scoreChange value=1
        avatar key > changeResource resource=key value=1
        
        key avatar > killSprite
        goal avatar >killIfOtherHasMore resource=key limit=1
        avatar goal > stepBack
        
        mushroom avatar > scoreChange value=1
        mushroom avatar > killSprite
    

    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=goal limit=0 win=True bonus=10
        SpriteCounter stype=avatar limit=0 win=False`};

var avoidgeorge_game = {level: `wwwwwwwwwwwwwwwwwwwwwwww
w......................w
w..c.........c.....c...w
w.......c..............w
w......................w
w........A.......c.....w
w..........c...........w
w......................w
w....c.............g...w
w......................w
wwwwwwwwwwwwwwwwwwwwwwww
`,
                         game : `BasicGame
    SpriteSet
	annoyed > RandomNPC speed=0.25 cons=2 color=PURPLE        
        citizen >
            quiet > RandomNPC speed=0.25 cons=1 color=GREEN
            avatar > ShootAvatar stype=cigarette  color=DARKBLUE


        george > Chaser stype=citizen color=YELLOW speed=0.15 frameRate=8
        cigarette > Flicker color=BROWN limit=5 rotateInPlace=False singleton=True 
        wall > Immovable color=BLACK

    TerminationSet
        SpriteCounter stype=avatar  win=False
        SpriteCounter stype=quiet   win=False
        Timeout limit=500 win=True bonus=0.02

    InteractionSet
        quiet george > transformTo stype=annoyed
	avatar george > scoreChange value=-1
        avatar george > killSprite 

	annoyed cigarette > scoreChange value=1
        annoyed cigarette > transformTo stype=quiet 

        annoyed wall > stepBack
        quiet wall > stepBack
        avatar wall > stepBack
	george wall > stepBack
    LevelMapping
        g > george
        c > quiet
        A > avatar
        w > wall
`};

var antagonist_game = {level: `wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
w                              w
w                              w
w                              w
w                              w
w             A                w
wm                             w
w             b                w
www                           aw
wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww`,
                         game : `BasicGame frame_rate=30
    SpriteSet
        avatar > MovingAvatar color=DARKBLUE cooldown=0
        chaser > VGDLSprite
            randomChaser > RandomNPC color=WHITE
            mediumChaser > Chaser color=LIGHTGREEN stype=box2 cooldown=8
            goodChaser > AStarChaser color=RED stype=box2
        forcefield > Passive color=LIGHTBLUE
        forcefield2 > Passive color=SCJPNE
        wall > Immovable color=DARKGRAY
        box > Passive
            box1 > color=PINK
            box2 > color=YELLOW
    LevelMapping
        w > wall
        a > box1
        b > box2
        m > mediumChaser
        r > randomChaser
        s > goodChaser
        f > forcefield
        e > forcefield2

    InteractionSet
        avatar wall > stepBack
        mover wall > stepBack
        avatar mover > stepBack
        box wall > stepBack
        box2 avatar > bounceForward
        box2 forcefield > nothing
        chaser forcefield > stepBack
        avatar forcefield > nothing
        box1 box2 > killSprite
        avatar chaser > nothing
        box1 avatar > killSprite
        box2 chaser > killSprite
        chaser box1 > stepBack
        chaser wall > stepBack
        box2 forcefield2 > nothing
        avatar forcefield2 > nothing
        chaser forcefield2 > nothing
    TerminationSet
	Timeout limit=2000 win=False
        SpriteCounter stype=avatar  limit=0 win=False
        SpriteCounter stype=box2  limit=0 win=False
        SpriteCounter stype=box1 limit=0 win=True bonus=10`};

var switch_game = function (game_name) {
	if (game_name == "aliens-button") {
        vgdl_game = aliens_game;
        exp_id = '0';
        data = {};
        data.real = 'gvgai_aliens';
        data.name = 'Aliens';
        data.desc = 0;
        data.level = 0;
        data.pair = 0;
        data.next = true;
        
        show_score = true;

  } else if (game_name == "antagonist-button") {    
      vgdl_game = antagonist_game;
      exp_id = '0';
      data = {};
      data.real = 'expt_antagonist';
      data.name = 'Antagonist';
      data.desc = 0;
      data.level = 0;
      data.pair = 0;
      data.next = true;
            
      show_score = true;

  } else if (game_name == "avoidgeorge-button") {
    vgdl_game = avoidgeorge_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_avoidgeorge';
    data.name = 'Avoidgeorge';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "bait-button") {
    vgdl_game = bait_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_bait';
    data.name = 'Bait';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;


  } else if (game_name == "beesandbirds-button") {
    vgdl_game = beesandbirds_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_bees_and_birds';
    data.name = 'bees_and_birds';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;
  } else if (game_name == "boulderdash-button") {
    vgdl_game = boulderdash_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_boulderdash';
    data.name = 'Boulderdash';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;
  } else if (game_name == "butterflies-button") {
    vgdl_game = butterflies_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_butterflies';
    data.name = 'Butterflies';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    show_score = true;

  } else if (game_name == "chase-button") {
    vgdl_game = chase_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_chase';
    data.name = 'Chase';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "closinggates-button") {
    vgdl_game = closinggates_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_closing_gates';
    data.name = 'Closing gates';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    show_score = true;

  } else if (game_name == "corridor-button") {
    vgdl_game = corridor_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_corridor';
    data.name = 'Corridor';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "exploreexploit-button") {
    vgdl_game = exploreexploit_game;
    exp_id = '0';
    data = {};
    data.real = 'expt_ee';
    data.name = 'Explore_Exploit';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "frogs-button") {
    vgdl_game = frogs_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_frogs';
    data.name = 'Frogs';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "helper-button") {
    vgdl_game = helper_game;
    exp_id = '0';
    data = {};
    data.real = 'expt_helper';
    data.name = 'Helper';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "jaws-button") {
    vgdl_game = jaws_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_jaws';
    data.name = 'Jaws';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "lemmings-button") {
    vgdl_game = lemmings_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_lemmings';
    data.name = 'Lemmings';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;
  } else if (game_name == "missilecommand-button") {
    vgdl_game = missilecommand_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_missilecommand';
    data.name = 'Missilecommand';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "myaliens-button") {
    vgdl_game = myaliens_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_myAliens';
    data.name = 'MyAliens';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "plaqueattack-button") {
    vgdl_game = plaqueattack_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_plaqueattack';
    data.name = 'Plaqueattack';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;
  } else if (game_name == "portals-button") {
    vgdl_game = portals_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_portals';
    data.name = 'Portals';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;
    
  } else if (game_name == "preconditions-button") {
    vgdl_game = preconditions_game;
    exp_id = '0';
    data = {};
    data.real = 'expt_preconditions';
    data.name = 'Preconditions';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "pushboulders-button") {
    vgdl_game = pushboulders_game;
    exp_id = '0';
    data = {};
    data.real = 'expt_push_boulders'
    data.name = 'Push boulders'
    data.desc = 0
    data.level = 0
    data.pair = 0
    data.next = true
    
    show_score = true;

  } else if (game_name == "relational-button") {
    vgdl_game = relational_game;
    exp_id = '0';
    data = {};
    data.real = 'expt_relational';
    data.name = 'Relational';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "sokoban-button") {
    vgdl_game = sokoban_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_sokoban';
    data.name = 'Sokoban';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "surprise-button") {
    vgdl_game = surprise_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_surprise';
    data.name = 'Surprise';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "survivezombies-button") {
    vgdl_game = survivezombies_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_survivezombies';
    data.name = 'Survivezombies';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "watergame-button") {
    vgdl_game = watergame_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_watergame';
    data.name = 'Watergame';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;

  } else if (game_name == "zelda-button") {
    vgdl_game = zelda_game;
    exp_id = '0';
    data = {};
    data.real = 'gvgai_zelda';
    data.name = 'Zelda';
    data.desc = 0;
    data.level = 0;
    data.pair = 0;
    data.next = true;
    
    show_score = true;
  }  
  gamejs = require('gamejs');;
  vgdl_parser = VGDLParser(gamejs);
  game = vgdl_parser.playGame(vgdl_game.game, vgdl_game.level, 0);
  
  $('#gjs-canvas').focus();
	$('#start').click(begin_game)

	game.paused = true;
	gamejs.ready(game.run(on_game_end));
}