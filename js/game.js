
/* Dansl.net 2011 */

var world;
var bg0;
var bg1;
var bg2;
var fg0;
var fg1;

var startGameScreen;
var gameStarted = false;

var touches = [];
var startTouchCoors = {x:null, y:null};
var touchCoors = {x:null, y:null};
var fingerDown = false;
var stats;

var csstransform;

var groundPos = {x:0, y:400, z:0};
var levelWidth = 2000;

var player;
var playerStandAni = "./img/CoreyStand.gif";
var playerRunAni = "./img/CoreyRun.gif";
var playerHurtAni = "./img/CoreyHurt.gif"
var playerMunch = "./img/CoreyEating.gif"
var playerDeadAni = "./img/CoreyHurt.gif"

var enemyDeadAni = "./img/CrabDeath.gif";
var enemyDeadAniEnd = "./img/CrabDeathEnd.png";
var enemyMunchAni = "CrabNom"
var enemyPlaceholder;
var enemyArray = [];
var numOfEnemies = 0;
var enemyCount = 0;
var controls;
var controlsThumb;

var gravity = 0.5;
var friction = .93;
var jumpSpeed = 12;

var screenWidth;
var screenHeight;

var controlKeyDown;
var jumpKeyDown;

var gameTime = 0;

var scoreBox;
var score = 0;
var healthBar;

var isGameOver = false;

function init(){
	console.log(navigator.userAgent.indexOf("Chrome"))
	if(navigator.userAgent.indexOf("Chrome") < 0 && navigator.userAgent.indexOf("Safari") < 0 && navigator.userAgent.indexOf("Mozilla")){
		console.log("GAME OVER")
		startGameScreen = document.querySelector("#startGame");
		startGameScreen.innerHTML = "<div style='position:relative; padding:250px 0 0 0'>Sorry...<br />This game will only run<br />in the <font color='#71C1DE'>Google Chrome Browser</font>...<br />Download it <a href='http://www.google.com/chrome' target='_blank'>HERE</a></div>";
		return
	}
	
	world = document.querySelector("#world");
	bg0 = document.querySelector("#bg0");
	bg1 = document.querySelector("#bg1");
	//bg2 = document.querySelector("#bg2");
	fg0 = document.querySelector("#fg0");
	fg1 = document.querySelector("#fg1");
	scoreBox = document.querySelector("#crabCount");
	healthBar = document.querySelector("#healthBar");
	
	enemyPlaceholder = document.querySelector("#enemyPlaceholder");
	
	document.addEventListener('touchstart',startTouch, false);
	document.addEventListener('touchmove',moveTouch, false);
	document.addEventListener('touchend',endTouch, false);
	document.addEventListener('keydown', keyPress, false);
	document.addEventListener('keyup', keyEnd, false);
	
	startGameScreen = document.querySelector("#startGame");
	startGameScreen.addEventListener("click", startGame, false);
	
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	
	css3transform = getSupportedProp(['transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform']);
    
    var playerPath = document.querySelector("#player");
    var playerSpritePath = document.querySelector("#playerSprite");
    player = new Body(playerPath,playerSpritePath, "player");
    player.width = 80;
    player.height = 130;
    player.maxSpeed = 30;
    player.canMove = false;
    
    controls = document.querySelector("#thumbControlBG");
    controlsThumb = document.querySelector("#thumbControl");
    
    //Stats - By MrDooB
    /*stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );*/
	
	//Starts World Render
	if ( !window.requestAnimationFrame ) {
		window.requestAnimationFrame = ( function() {
			return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( callback, element ) { window.setTimeout( callback, 20 ); };
		} )();
	}
	
	renderWorld();
	
	stopSound("#burp0");
	stopSound("#burp1");
	stopSound("#burp2");
	stopSound("#burp3");
	stopSound("#music");
	stopSound("#hit");
	stopSound("#crunch");
	stopSound("#crack");
	stopSound("#gameOver");
}

function startGame(){
	//Starts Game, hides splash screen
	//console.log("CLICK");
	if(!isGameOver){
		gameStarted = true;
		startGameScreen.style.display = "none";
		
		createEnemy();
		player.canMove = true;
		
		var tempMusicPath = document.querySelector("#music");
		tempMusicPath.play();
	}else{
		location.reload(true);
	}
}

function createEnemy(){
	//console.log("NUM OF ENEMIES: " + numOfEnemies)
	if(numOfEnemies < 100){
		var newEnemyDiv = document.createElement("div");
		newEnemyDiv.setAttribute("class","enemy");
		var newEnemySprite = document.createElement("img");
		newEnemySprite.setAttribute("class","enemySprite");
		newEnemySprite.setAttribute("src","./img/Crab.gif");
		
		newEnemyDiv.appendChild(newEnemySprite);
		enemyPlaceholder.appendChild(newEnemyDiv);
		
	    var enemyObj = new Body(newEnemyDiv,newEnemySprite, "enemy");
	    enemyObj.idNum = enemyCount;
	    enemyObj.position.x = Math.random() * levelWidth;
	    enemyObj.position.y = -100;
	    enemyObj.width = 100;
	    enemyObj.height = 70;
	    var tempMaxSpeed = Math.random()*5+score;
	    enemyObj.maxSpeed = Math.round(tempMaxSpeed);
	    
	    enemyArray.push(enemyObj);
	    enemyCount++;
	    numOfEnemies++;
	}
	if(!isGameOver){
		var timeOffset = 3000-(score*10);
		timeOffset = timeOffset < 100 ? timeOffset = 100 : timeOffset = timeOffset;
	    setTimeout(createEnemy, timeOffset);
	}
}

function playSoundOnce(_path, _time){
	//Play a sound Once
	var tempSoundPath = document.querySelector(_path);
	//tempSoundPath.addEventListener("ended", function(){stopSound(_path)}, false);
	if(tempSoundPath){
		//tempSoundPath.currentTime = 0;
		tempSoundPath.play();
		setTimeout(function(){stopSound(_path)}, _time);
	}
}

function stopSound(_path){
	//Stop a sound
	var tempSoundPath = document.querySelector(_path);
	if(tempSoundPath){
		tempSoundPath.pause();
	}
}

function keyPress(e){
	//Keyboard Press
	if(e.keyCode == 39 || e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 40 || e.keyCode == 83){
		controlKeyDown = e.keyCode;
	}
	if(e.keyCode == 38 || e.keyCode == 32){
		bodyJump(player, jumpSpeed);
	}
}

function keyEnd(e){
	//Keyboard End
	if(controlKeyDown == e.keyCode){
		controlKeyDown = 0;
	}
}

function bodyJump(_body, _jumpAmount, _force){
	//Make body jump X amount
	if((_body.onGround && !_body.jumping && !_body.dead) || _force == true){
		_body.onGround = false;
		_body.jumping = true;
		_body.velocity.y = -_jumpAmount;
		//playSoundOnce("#jumpSound");
	}
}

//Body Object Class
function Body(_path, _sprite, _type){
	this.path = _path;
	this.sprite = _sprite;
	this.width = 40;
	this.height = 40;
	this.position = {x:0, y:0, z:0};
	this.velocity = {x:0, y:0, z:0};
	this.onGround = false;
	this.jumping = false;
	this.direction = 1;
	this.accel = 0.4;
	this.maxSpeed = 5;
	this.running = false;
	this.hit = false;
	this.canMove = true;
	this.idNum;
	this.dead = false;
	this.type = _type;
	this.health = 3;
	this.hitJump = false;
	this.remove = false;
}

function renderPlayer(_body){
	if(_body.canMove && !_body.dead && !_body.hit){
		//Ground Friction
		_body.velocity.x *= friction;
		
		// Move player with controls
		if(touchCoors.x > (startTouchCoors.x + 5) || controlKeyDown == 39 || controlKeyDown == 68){
			_body.velocity.x += _body.accel;
			_body.direction = 1;
		}else if(touchCoors.x < (startTouchCoors.x - 5) || controlKeyDown == 37 || controlKeyDown == 65){
			_body.velocity.x += _body.accel;
			_body.direction = -1;
		}
		
		if(_body.velocity.x > 1 && !_body.running){
			_body.running = true;
			_body.sprite.src = playerRunAni;
		}else if(_body.velocity.x < 1 && _body.running){
			_body.running = false;
			_body.sprite.src = playerStandAni;
			_body.sprite.style.top = 0;
		}
		
		var tempNum = 0;
		//tempNum %= numOfEnemies;
		while(tempNum < numOfEnemies){
			var collision = detectCollide(_body, enemyArray[tempNum]);
			if(collision == 1 && !_body.hit){
				if(enemyArray[tempNum].dead == true && (controlKeyDown == 40 || controlKeyDown == 83) && !enemyArray[tempNum].hit){
					if(enemyArray[tempNum].health > 0){
						controlKeyDown = 0;
						_body.running = false;
						enemyArray[tempNum].health --;
						enemyArray[tempNum].sprite.src = ("./img/"+enemyMunchAni+enemyArray[tempNum].health + ".png");
						_body.sprite.src = playerMunch;
						setTimeout(function(){_body.sprite.src = playerStandAni;}, 100);
						playSoundOnce("#crunch", 500);
					}else{
						_body.running = false;
						enemyArray[tempNum].remove = true;
						enemyArray[tempNum].path.style.display = "none";
						_body.sprite.src = playerMunch;
						setTimeout(function(){_body.sprite.src = playerStandAni;}, 250);
						playSoundOnce("#crunch", 500);
					}
				}else if(!enemyArray[tempNum].dead){
					playerHit(_body, enemyArray[tempNum]);
				}
			}else if(collision == 2 && !_body.hit && enemyArray[tempNum].onGround){
				killEnemy(enemyArray[tempNum]);
				_body.hit = true;
				bodyJump(_body, jumpSpeed, true);
				setTimeout(function(){_body.hit = false}, 250);
			}
			tempNum++;
		}
	}
	renderBody(_body);
}

function killEnemy(_body){
	//console.log(_body.idNum)
	if(!_body.dead){
		playSoundOnce("#crack", 500);
		_body.dead = true;
		_body.sprite.src = enemyDeadAni;
		setTimeout(function(){
			_body.sprite.src = enemyDeadAniEnd;
		}, 1000);
		//_body.position = {x:-100, y:-100}
		//_body.path.style.display = "none";
	}
}

function playerHit(_body0, _body1){
	if(!_body0.hit && _body0.health > 0){
		playSoundOnce("#hit", 500);
		_body0.health--;
		//healthBar.style["background-image"] = 'url("./img/Hit'+(_body0.health+1)+'.gif")';
		healthBar.innerHTML = "";
		for( var i= 0; i <=  _body0.health; ++i){
			healthBar.innerHTML += "&hearts;";
		}
		_body0.hit = true;
		_body1.hit = true;
		_body0.running = false;
		_body1.running = false;
		_body0.sprite.src = playerHurtAni;
		_body0.velocity.x = 0;
		_body1.velocity.x = 0;
		_body0.velocity.x = _body0.position.x < _body1.position.x ? _body0.velocity.x = -5 : _body0.velocity.x = 5;
		bodyJump(_body0, 10);
		setTimeout(function(){
			_body0.sprite.src = playerStandAni;
			_body0.hit = false;
			_body1.hit = false;
		}, 1000);
	}else if(_body0.health <= 0){
		healthBar.innerHTML = "";
		//healthBar.style["background-image"] = 'url("./img/Hit0.gif")';
		gameOver();
	}
}

function gameOver(){
	if(!isGameOver){
		player.velocity = {x:0, y:0, z:0};
		player.sprite.src = playerDeadAni;
		player.dead = true;
		isGameOver = true;
		stopSound("#music");
		var tempSoundPath = document.querySelector("#gameOver");
		tempSoundPath.currentTime = 0;
		tempSoundPath.play();
		startGameScreen.style.display = "block";
		startGameScreen.innerHTML = "<div style='position:relative; padding:250px 0 0 0'>GAME OVER<br />You only ate "+ score +" crabs...<br /><br />Click anywhere to retry</div>";
	}
}

function renderEnemy(_body){
	if(_body.canMove && !_body.dead){
		//Ground Friction
		_body.velocity.x *= friction;	
		
		//var randomMovement = Math.random()*10;
		//if(randomMovement <= 3){
			//Move Enemy
			_body.velocity.x += _body.accel;
		//}
		
		renderBody(_body);
	}
}

function removeEnemy(_num){
	enemyArray.splice(_num,1);
	numOfEnemies--;
	score++;
	scoreBox.innerHTML = score;
	var tempSoundPath = "#burp"+Math.round(Math.random()*3);
	//console.log(tempSoundPath);
	playSoundOnce(tempSoundPath, 500);
}

function renderBody(_body){
	//if(_body.canMove && !_body.dead && !_body.hit){
		//Gravity
		_body.velocity.y += gravity;
		
		// Keeps player from going through floor
		if( (_body.position.y + _body.height) >= groundPos.y){
			_body.position.y =  (groundPos.y - _body.height);
			if(!_body.jumping && _body.onGround){
				_body.velocity.y = 0;
			}
			_body.onGround = true;
			_body.jumping = false;
		}else{
			_body.onGround = false;
		}
		
		
		
		//Max Speed Cap
		_body.velocity.x > _body.maxSpeed ? _body.velocity.x = _body.maxSpeed : _body.velocity.x = _body.velocity.x;
		//_body.velocity.y > _body.maxSpeed ? _body.velocity.y = _body.maxSpeed : _body.velocity.y = _body.velocity.y;
		
		//Set Player Position
		_body.position.x = (_body.position.x + (_body.velocity.x * _body.direction));
		_body.position.y = (_body.position.y + _body.velocity.y);
		
		if(_body.position.x < -40){
			if(_body.type == "player"){
				 _body.position.x = -40 ;
			}else{
				_body.direction = 1;
			}
		}
		if((_body.position.x + _body.width) > levelWidth){
			if(_body.type == "player"){
				_body.position.x = (levelWidth-_body.width);
			}else{
				_body.direction = -1;
			}
		}
		
		//Sets Player CSS3 properties
		changeCss3(_body.sprite, css3transform, "scale("+_body.direction+", 1)");
		changeCss3(_body.path, css3transform, "translate3d("+_body.position.x+"px,"+_body.position.y+"px,"+_body.position.z+"px)");
	//}
}

function renderWorld(){	
	//Render Players/enemies
	renderPlayer(player);
	
	var i = 0;
	while (i < numOfEnemies){
		if(enemyArray[i].remove){
			removeEnemy(i);
		}else{
			renderEnemy(enemyArray[i]);
		}
  		i++;
  	}
  	
	var worldPOS = (-player.position.x+(screenWidth*0.5));
	worldPOS > 0 ? worldPOS = 0 : worldPOS = worldPOS;
	worldPOS < (-levelWidth+screenWidth) ? worldPOS = (-levelWidth+screenWidth) : worldPOS = worldPOS;
	changeCss3(world, css3transform, "translate3d("+worldPOS+"px, 0, 0)");
	changeCss3(bg0, css3transform, "translate3d("+(worldPOS*0.1)+"px, 0, 0)");
	changeCss3(bg1, css3transform, "translate3d("+(worldPOS*0.2)+"px, 0, 0)");
	//changeCss3(bg2, css3transform, "translate3d("+(worldPOS*0.1)+"px, 0, 0)");
	changeCss3(fg0, css3transform, "translate3d("+(worldPOS*1.2)+"px, 0, 0)");
	changeCss3(fg1, css3transform, "translate3d("+(worldPOS*1.1)+"px, 0, 0)");
	
	//FPS
	//stats.update();
	
	//Renderer Loop
	//window.requestAnimationFrame( renderWorld );
	setTimeout(renderWorld, 20);
	gameTime++;
}

function startTouch(e){
	e.preventDefault();
	
	//start game
	if(!gameStarted){
		startGame();
		return false;
	}
	
	//Record Touches
	var allTouches = e.touches;
	var numOfTouches = allTouches.length;		
	for (var i = 0; i < numOfTouches; ++i){
		recordTouch(allTouches[i]);
	}
}

function moveTouch(e){
	e.preventDefault();
	
	//Move Touches
	var allTouches = e.touches;
	var numOfTouches = allTouches.length;
	for (var i = 0; i < numOfTouches; ++i){
		moveTouches(allTouches[i]);
	}
}

function endTouch(e){
	//Remove Touches
	var allTouches = e.touches;
	removeTouch(allTouches);
}

function recordTouch(touch){
	//Detect new Touch
	if (newTouch(touch)){
		var t = {touch: touch};	
		touches.push(t);
		
		//Place Left Sticks
		if(touch.pageX < (screenWidth * 0.5)){
			touchCoors.x = touch.pageX;
			touchCoors.y = touch.pageY;
			startTouchCoors.x = touchCoors.x;
			startTouchCoors.y = touchCoors.y;
			controls.style.display = "block";
			controlsThumb.style.display = "block";
			changeCss3(controls, css3transform, "translate3d("+(touchCoors.x-50)+"px,"+(touchCoors.y-50)+"px,0)");
			changeCss3(controlsThumb, css3transform, "translate3d("+(touchCoors.x-25)+"px,"+(touchCoors.y-25)+"px,0)");
		}
		
		//Right side Jump
		if(touch.pageX > (screenWidth * 0.5)){
			bodyJump(player, jumpSpeed);
		}	
	}
}

function moveTouches(touch){
	//Move Player Contorls
	if(touch.pageX < (screenWidth * 0.5)){
		touchCoors.x = touch.pageX;
		touchCoors.y = touch.pageY;
	    changeCss3(controlsThumb, css3transform, "translate3d("+(touchCoors.x-25)+"px,"+(touchCoors.y-25)+"px,0)");
	    return false;
	}
}

function newTouch(touch){
	//Create Touch
	var numOfTouches = touches.length;
	for (var i = 0; i < numOfTouches; ++i){
		if (touches[i].touch.identifier == touch.identifier){
			return false;
		}
	}
	return true;
}

function removeTouch(all_touches){
	//Remove Touch
	var toRemove = [];
	var numOfTouches = touches.length;
	var allTouchesNum = all_touches.length;
	for (var i = 0; i < numOfTouches; ++i){
		var found  = false;
		for (var j = 0; j < allTouchesNum; ++j ){
			if (touches[i].touch.identifier == all_touches[j].identifier){
				found = true;
			}
		}
		if (!found){
			toRemove.push({obj: touches[i], ref: i })
		}
	}
	for (var ii = 0; ii < toRemove.length; ++ii){
		for (var jj = 0; jj < touches.length; ++jj){
			if (touches[jj].touch.identifier == toRemove[ii].obj.touch.identifier){
				//Remove Player Controls
				if(touches[jj].touch.pageX < (screenWidth*0.5)){
					touchCoors.x = null;
					touchCoors.y = null;
					startTouchCoors.x = null;
					startTouchCoors.y = null;
					controls.style.display = "none";
					controlsThumb.style.display = "none";
				}
				touches.splice(jj ,1);
			}
		}
	}
}	

//Get supported CSS3 property
function getSupportedProp(_array){
    var root = document.documentElement;
    for (var i=0; i<_array.length; i++){
        if (typeof root.style[_array[i]]=="string"){
        	//console.log(_array[i]);
            return _array[i];
        }
    }
}

//Shorthand CSS3 changer
function changeCss3(_target, _prop, _value, _action){
    if (typeof _prop != "undefined"){
        _target.style[_prop]=(_action=="remove")? "" : _value;
	}
}

function detectCollide(object1, object2) {
		var left1, left2;
		var right1, right2;
		var top1, top2;
		var bottom1, bottom2;
	
		left1 = object1.position.x;
		left2 = object2.position.x;
		right1 = object1.position.x + object1.width;
		right2 = object2.position.x + object2.width;
		top1 = object1.position.y;
		top2 = object2.position.y;
		bottom1 = object1.position.y + object1.height;
		bottom2 = object2.position.y + object2.height;
	
		if (bottom1 < top2) return(0);
		if (top1 > bottom2) return(0);
	
		if (right1 < left2) return(0);
		if (left1 > right2) return(0);
		
		//Hit emeny on head
		if(object2.type == "enemy" && !object2.dead){
			if(bottom1 < (bottom2-(object2.height*0.5))) return(2);
		}
	
		return(1);
	
}

window.addEventListener('load', init, false);