var MongoClient=require('mongodb').MongoClient;
var express=require('express');
var app=express();

var mongoURI='mongodb://ds057176.mlab.com:57176/today';
var db_user="panjintian";
var db_password="panjintian";
var collectName="AISnakeCollection";
var clientCollect="ClientCollection";
var msgCollection = "Messages";

var size=20; //this number must be equal to size in script.js
var dbglobal={};
var io={};
var time={};
var rowMove=[-1,0,1];
var colMove=[-1,0,1];
var wholeMove=[[1,0],[-1,0],[0,1],[0,-1]];
var MAX_AISNAKE_NUM=1;
var curAISnake=0;
var MAX_FOOD_NUMBER = 2;
var SNAKE_LENGTH = 4;
var BOARD_PARAMS = {"height": 40, "width": 60};
var allSnakes = {};
var snakeGrids = new Set(); //all the girds occupied by snake, saved grid ID "25"
var foodGrids = new Set(); //all the grids occupied by food, saved grid ID "25"
var colorPool = ["SALMON", "HOTPINK", "ORANGERED", "GOLD", "MAGENTA", "SPRINGGREEN", "LIGHTSEAGREEN", "CYAN", "TURQUOISE", "STEELBLUE", "ROYALBLUE", "WHEAT", "SANDYBROWN"];
var INFINITE=BOARD_PARAMS.width*BOARD_PARAMS.height+10;
var allAiSnakes={};
//Snake Class
//snake save as [tail, body, head]
//every movement, first check whether the next position is a food.
//If food, eat it. and update the position(food is always a legal gird)
//If not a food update the snake to the new position, then check the new position is legal or not
//if legal, notify the client to draw the movement, or not, delete the snake
var goDie=function(snakesPool) {
	var erase = [];
	console.log("die");
	this.body.forEach(function(ele) {
		erase.push(xyToPos(ele.row, ele.col));
		snakeGrids.delete(xyToPos(ele.row, ele.col));
	})
	io.sockets.emit('redraw', {"erase": erase, "append": []});
	colorPool.push(this.color);
	delete snakesPool[this.username];
}



var nextStep=function(nextPos) {
	this.body.push(posToXY(nextPos));
	var tailXY = this.body.shift(); //remove the tail first
	var tail = xyToPos(tailXY.row, tailXY.col);
	snakeGrids.delete(tail);
	snakeGrids.add(nextPos);
	io.sockets.emit(
		'redraw',
		{
			"erase": [tail],
			"append": [nextPos],
			"color": this.color,
		}
	);
}

var nextMove=function() {
	var nextPosXY = null;
	var nextPos = 0;
	var head = this.body[this.body.length-1];
	if (this.direction == "up") {
		nextPosXY = {"row": head.row - 1, "col": head.col};
	} else if (this.direction == "down") {
		nextPosXY = {"row": head.row + 1, "col": head.col};
	} else if (this.direction == "left") {
		nextPosXY = {"row": head.row, "col": head.col - 1};
	} else {
		nextPosXY = {"row": head.row, "col": head.col + 1};
	}
	nextPos = xyToPos(nextPosXY.row, nextPosXY.col);
    var targetRes=this.getToAllSnakeDis(allSnakes,allAiSnakes);
    // console.log("target snake:"+targetRes.closetSnake);
    // console.log("target pool:"+targetRes.closetPool);
    // console.log("target dismin:"+targetRes.minDis);
    if(targetRes.minDis==1){
    	this.eatSnake(targetRes.closetSnake,targetRes.closetPool);
    }
    else{
		if (foodGrids.has(nextPos)) {
			this.eat(nextPos);
		}
		else {
			if (canMove(nextPosXY)) {
				this.nextStep(nextPos);
			}
			else {
				console.log("die");
				this.goDie(allSnakes);
			}
		}
	}
}

var eat=function(nextPos) {
	this.body.push(posToXY(nextPos));
	this.length=this.body.length;
	foodGrids.delete(nextPos);
	snakeGrids.add(nextPos);
	io.sockets.emit(
		'redraw',
		{
			"erase": [],
			"append": [nextPos],
			"color": this.color,
		}
	);
}

function Snake(username) {
	this.username = username;
	this.color = colorPool.shift();
	this.length = SNAKE_LENGTH;
	this.direction = "right";
	this.body = getUnusedPlace(); //saved {"row": "2", "col": "5"}
	var append = [];
	this.goDie=goDie;
	this.nextStep=nextStep;
	this.nextMove=nextMove;
	this.eat=eat;
	this.eatSnake=eatSnake;
	this.getToAllSnakeDis=getToAllSnakeDis;
	this.body.forEach(function(ele) {append.push(xyToPos(ele.row, ele.col))});
	io.sockets.emit('redraw', {"erase": [], "append": append, "color": this.color});
}




//1. player set username
//2. player type "play" to init a snake (will send a /play post from client), snake will appear and move toward right direction
//3. player change the direction (will send a /move post from client)

MongoClient.connect(mongoURI,function(err,db){
	if(err)
		console.log('connect error');
	else{
		db.authenticate(db_user,db_password,function(err,result){
			if(err)
				throw err;
			else{
				test = new Set();
				app.use(express.static('public'));
				app.set('view engine','ejs');
				var bodyParser = require('body-parser');
				app.use(bodyParser.json());
				app.use(bodyParser.urlencoded({ extended: true }));
				var port=process.env.PORT||5001;
				var server=app.listen(port,function(){
					console.log('listen on 5001');
				})
				io=require('socket.io').listen(server);
				app.get('/',function(req,res){
					db.collection(msgCollection).find().toArray(
						function(err, allMessages) {
							res.render('index', {'messages': allMessages});
					})
				});
				app.post('/init', function(req,res){
					res.send(BOARD_PARAMS);
				});
				app.post('/move', function(req,res){
					var conflictDirection = {"up": "down", "down": "up", "left": "right", "right": "left"};
					if (allSnakes.hasOwnProperty(req.body.username) && req.body.cmd != conflictDirection[allSnakes[req.body.username].direction]) {
						allSnakes[req.body.username].direction = req.body.cmd;
					}
					res.send('success');
				});
				app.post('/play', function(req,res){
					if (!allSnakes.hasOwnProperty(req.body.username)) {
						allSnakes[req.body.username] = new Snake(req.body.username);
					}
					res.send('success');
				});

				io.sockets.on('connection', function(socket) {
					socket.on('setUsername', function(data) {
          	socket.username = data;
          })

          socket.on('message', function (message) {
            db.collection(msgCollection).find().toArray(
              function(err, words) {
                var data = { 'message' : message, 'username': socket.username };
                socket.broadcast.emit('message', data);
                db.collection(msgCollection).insert(data, function(err, ids){})
            });
          })
          socket.on('createAISnake',function(){
          	if(curAISnake<MAX_AISNAKE_NUM)
          		generateAiSnake(1);
          })
		socket.on('disconnect',function(){
			var username = socket.username;
			if (allSnakes.hasOwnProperty(username)) {
				allSnakes[username].goDie(allSnakes);
			}
		})
				})
				tick = setInterval(updateState, 400);
				AiSnakeTick=setInterval(updateAISnake,200);
			}
	})}
})
function updateCurSnakeNum(){
	curAISnake=Object.keys(allAiSnakes).length;
}
function updateState() {
	generateFood()
	for (var key in allSnakes) {

  		allSnakes[key].nextMove();
	}
}

function generateFood() {
	var foods = [];
	if (foodGrids.size < MAX_FOOD_NUMBER) {
		var gridSize = foodGrids.size;
		for (var i = 0; i < (MAX_FOOD_NUMBER - gridSize); i++) {
			while (true) {
				var pos = getRandomInt(0, BOARD_PARAMS.width * BOARD_PARAMS.height - 1);
				if (!foodGrids.has(pos) && !snakeGrids.has(pos)) {
					foods.push(pos);
					foodGrids.add(pos);
					break;
				}
			}
		}
	}
	foodGrids.forEach(function(ele) {foods.push(ele)});
	io.sockets.emit('redraw', {"erase": [], "append": foods, "color": "RED"});
}

function getUnusedPlace() {
	while (true) {
		var pos = getRandomInt(0, BOARD_PARAMS.width * BOARD_PARAMS.height - 1);
		var posXY = posToXY(pos);
		var body = [];

		var i = 5; //5 ununsed grid before the head
		while (i > -SNAKE_LENGTH) {
			body.push({"row": posXY.row, "col": posXY.col + i})
			i--;
		}

		if (body.every(function(ele) {return (canMove(ele) && !foodGrids.has(xyToPos(ele.row, ele.col)))})) {
			body = body.slice(5, body.length).reverse();
			body.forEach(function(ele) {snakeGrids.add(xyToPos(ele.row, ele.col))});
			return body;
		}
	}
}

function canMove(posXY) {
	if (
		posXY.row < 0 ||
		posXY.col < 0 ||
		posXY.row >= BOARD_PARAMS.height ||
		posXY.col >= BOARD_PARAMS.width ||
		snakeGrids.has(xyToPos(posXY.row, posXY.col))
	) {
		return false;
	}
	return true;
}

function posToXY(pos) {
	var col = pos % BOARD_PARAMS.width;
	var row = Math.floor( pos / BOARD_PARAMS.width);
	return {"row": row, "col": col};
}

function xyToPos(row, col) {
	return (row * BOARD_PARAMS.width + col);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}




/*the following code is to define a AISnake, by Jintian*/

var choicePriority={
	firstQuadrant:[[0,1],[-1,0],[1,0],[0,-1]],// preyRow<=airow&&precol>aicol
	secondQuadrant:[[-1,0],[0,-1],[1,0],[0,1]],//preyRow<airow&&preycol<=aicol
	thirdQuadrant:[[0,-1],[1,0],[0,1],[-1,0]],//preyRow>=airow&&preycol<aicol
	fourthQuadrant:[[1,0],[0,1],[-1,0],[0,-1]]//preyRow>airow&&preycol>aicol
};
var generateAiSnake=function(){
	var name="AISnake"+curAISnake;
	allAiSnakes[name]=AIsnake();
	allAiSnakes[name].createSnake();
	var append = [];
	allAiSnakes[name].body.forEach(function(ele) {append.push(xyToPos(ele.row, ele.col))});
	io.sockets.emit('redraw', {"erase": [], "append": append, "color": allAiSnakes[name].color});
}
var updateAISnake=function(){
	for (var key in allAiSnakes){
  		allAiSnakes[key].track();
	}
}
var eatSnake=function(username,preySnakesPool){
	var prey=preySnakesPool[username];
	while(prey.body.length!=0){
		this.body.push(prey.body.pop());
	}
	this.length=this.body.length;
	delete preySnakesPool[username];
}

var aiNextMove=function() {
	var nextPosXY = null;
	var nextPos = 0;
	var head = this.body[this.body.length-1];
	if (this.direction == "up") {
		nextPosXY = {"row": head.row - 1, "col": head.col};
	} else if (this.direction == "down") {
		nextPosXY = {"row": head.row + 1, "col": head.col};
	} else if (this.direction == "left") {
		nextPosXY = {"row": head.row, "col": head.col - 1};
	} else {
		nextPosXY = {"row": head.row, "col": head.col + 1};
	}
	nextPos = xyToPos(nextPosXY.row, nextPosXY.col);
	this.nextStep(nextPos);
}

/* create a snake recursively */
function createSnake(len,body,posXY){
	if(len==0){
		return true;
	}
	else if(!canMove(posXY))
		return false;
	else{
		body.splice(0,0,posXY);
		snakeGrids.add(xyToPos(posXY));
		if(createSnake(len-1,body,{"row": posXY.row+1, "col": posXY.col})){
			return true;
		}
		else if(createSnake(len-1,body,{"row": posXY.row-1, "col": posXY.col})){
			return true;
		}
		else if(createSnake(len-1,body,{"row":posXY.row,"col":posXY.col+1})){
			return true;
		}
		else if(createSnake(len-1,body,{"row":posXY.row,"col":posXY.col-1})){
			return true;
		}
		else{
			body.shift();
			snakeGrids.delete(xyToPos(posXY));
			return false;
		}
	}
}

var getLastElement=function(arr){
	var ele=arr.pop();
	arr.push(ele);
	return ele;
}

var getDirection=function(dirArr){
	if(dirArr[0]==1)
		return "down";
	else if(dirArr[0]==-1)
		return "up";
	else if(dirArr[1]==1)
		return "right";
	else
		return "left";
}

var getDis=function(head1,head2){
	return Math.abs(head1.row-head2.row)+Math.abs(head1.col-head2.col);
}

var getToAllSnakeDis=function(clientSnakesPool,aiSnakesPool){
	var minDis=INFINITE;
	var res1=searchTarget(this,clientSnakesPool,minDis);
	var res2=searchTarget(this,aiSnakesPool,minDis);
	return res1.minDis<=res2?res1:res2;
}

var searchTarget=function(predator,snakesPool,minDis){
	var predatorHead=getLastElement(predator.body),closetSnake=" ",closetPool=" ";
	for(var key in snakesPool){
		if(key!=predator.username&&predator.length>snakesPool[key].length){
			var dis=getDis(predatorHead,getLastElement(snakesPool[key].body));
			if(dis<minDis){
				minDis=dis;
				closetSnake=key;
				closetPool=snakesPool;
			}
		}
	}
	return {minDis:minDis,closetSnake:closetSnake,closetPool:closetPool};
}
var AIsnake=function(name){
	var ai=new Object();
	ai.color="black";
	ai.username=name;
	ai.body=[];
	ai.length=5;
	ai.direction=" ";
	ai.prefSnakeName=" ";
	ai.goDie=goDie;
	ai.move=aiNextMove;
	ai.eatSnake=eatSnake;
	ai.nextStep=nextStep;
	ai.createSnake=function(){
		var tryCount=100;
		var success=false;
		while(this.body.length==0&&tryCount>0){
			var pos=getRandomInt(0,BOARD_PARAMS.height*BOARD_PARAMS.width);
			sucess=createSnake(this.length,this.body,posToXY(pos));
			tryCount--;
		}
		return sucess;
	}
	ai.track=function(){
		if(Object.keys(allSnakes).length==0)
			return;
		var minDis=INFINITE;
		var aiHead=getLastElement(this.body);
		for (var key in allSnakes){
			var head=getLastElement(allSnakes[key].body);
			var dis=getDis(aiHead,head);
			if(dis<minDis){
				this.prefSnakeName=key;
				minDis=dis;
			}
		}
		console.log(Object.keys(allSnakes).length);
		if(minDis==1&&this.length>allSnakes[this.prefSnakeName].length)
			this.eatSnake(this.prefSnakeName,allSnakes);
		else if(this.length>allSnakes[this.prefSnakeName].length){
			var priority=[];
			var prefHead=getLastElement(allSnakes[this.prefSnakeName].body);
			/*select the priority try sequence*/
			if(prefHead.row<=aiHead.row&&prefHead.col>aiHead.col)
				priority=choicePriority.firstQuadrant;
			else if(prefHead.row<aiHead.row&&prefHead.col<=aiHead.col)
				priority=choicePriority.secondQuadrant;
			else if(prefHead.row>=aiHead.row&&prefHead.col<aiHead.col)
				priority=choicePriority.thirdQuadrant;
			else 
				priority=choicePriority.fourthQuadrant;
			for(var i=0;i<=priority.length;i++){
				if(i==priority.length)
					this.goDie(allAiSnakes);
				else if(canMove({"row":aiHead.row+priority[i][0],"col":aiHead.col+priority[i][1]})){
					this.direction=getDirection(priority[i]);
					this.move();
					break;
				}
			}
		}
	}
	return ai;
}
