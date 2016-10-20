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

var allSnakes = [];
var BOARD_PARAMS = {"height": 40, "width": 60};
var snakeGrids = new Set(); //all the girds occupied by snake
var foodGrids = new Set(); //all the grids occupied by
var COLOR_POOL = ["SALMON", "HOTPINK", "ORANGERED", "GOLD", "MAGENTA", "SPRINGGREEN", "LIGHTSEAGREEN", "CYAN", "TURQUOISE", "STEELBLUE", "ROYALBLUE", "WHEAT", "SANDYBROWN"];
var SNAKE_LENGTH = 3;

//Snake Class
function Snake(username) {
	this.username = username;
	this.color = colorPool.shift();
	this.length = SNAKE_LENGTH;
	this.direction = "d";
	this.body = [];
}

Snake.prototype.

MongoClient.connect(mongoURI,function(err,db){
	if(err)
		console.log('connect error');
	else{
		db.authenticate(db_user,db_password,function(err,result){
			if(err)
				throw err;
			else{
				app.use(express.static('public'));
				app.set('view engine','ejs');
				var bodyParser = require('body-parser');
				app.use(bodyParser.json());
				app.use(bodyParser.urlencoded({ extended: true }));
				var server=app.listen(5001,function(){
					console.log('listen on 5001');
				})
				io=require('socket.io').listen(server);

				app.get('/',function(req,res){
					db.collection(msgCollection).find().toArray(
						function(err, allMessages) {
							res.render('index', {'messages': allMessages})
					})
				});
				app.post('/init', function(req,res){
					res.send(BOARD_PARAMS);
				});
				app.post('/move', function(req,res){

					setInterval(moveSnake(req.body.username, req.body.cmd, io), 1000);
					res.send('success');
				});
				app.post('/play', function(req,res){
					initialSnake(req.body.username, io);
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

					// socket.on('createSnake',function(snakeInfo){
					// 	db.collection(collectName).find().toArray(function(err,allSnakes){
					// 		if(err){
					// 			console.log('err happend in createSnake');
					// 		}
					// 		else if(!exist(snakeInfo['name'],allSnakes)){
					// 			var tryCount=size*size;
					// 			var snake=[];
					// 			var pos=0;
					// 			console.log('starting create');
					// 			while(tryCount>0&&!createSnake(snakeInfo.len,snake,pos,allSnakes)){
					// 				tryCount--;
					// 				pos=Math.floor(Math.random()*size*size);
					// 				console.log('starting create');
					// 			}
					// 			if(tryCount==0)
					// 				socket.emit('status',{'code': '404'});
					// 			else{
					// 				socket.emit('status',{'code': '101'});
					// 				var text='{"snakeName"'+':'+'"'+snakeInfo.name+'"'+','+'"pos"'+':'+'['+snake+']'+'}';
					// 				allSnakes.push(JSON.parse(text));
					// 				db.collection(collectName).insert({'snakeName': snakeInfo.name, 'pos': snake});
					// 			}
					// 		}
					// 		var data=[];
					// 		for(var i=0;i<allSnakes.length;i++){
					// 			data.push({'set':allSnakes[i].pos,'unset':[]});
					// 		}
					// 		io.sockets.emit('moveSnake',data);
					// 	})
					// })

					//time=setTimeout(move,2000);
					socket.on('disconnect',function(){
						console.log('disconnect');
						clearTimeout(time);
					})
				})
		}
})}
})

function initialSnake(username, io) {
	var pos = getUnusedPlace();
	snakeGrids.add(pos);
	allSnakes[username] = [pos];
	io.sockets.emit('redraw', {"erase": [], "append": Array.from(snakeGrids), "color": "black"});
}

//snake save as [tail, body, head]
//every movement, first update the snake to the new position
//then check the new position is legal or not
//if legal, notify the client to draw the movement, or not, delete the snake

function moveSnake(username, cmd, io) {
	var nextPosXY = null;
	var nextPos = 0;
	var snake = allSnakes[username];
	var head = posToXY(snake[snake.length-1]);

	if (cmd == "w") {
		nextPosXY = {"row": head.row - 1, "col": head.col};
	} else if (cmd == "s") {
		nextPosXY = {"row": head.row + 1, "col": head.col};
	} else if (cmd == "a") {
		nextPosXY = {"row": head.row, "col": head.col - 1};
	} else {
		nextPosXY = {"row": head.row, "col": head.col + 1};
	}
	nextPos = xyToPos(nextPosXY.row, nextPosXY.col);

	snake.push(nextPos); //push the next position as head, then check if it is legal
	var tail = snake.shift() //remove the tail first
	snakeGrids.delete(tail);

	if (canMove(nextPosXY)) {
		console.log('move', tail, nextPos);
		snakeGrids.add(nextPos);
		io.sockets.emit('redraw', {"erase": [tail], "append": [nextPos], "color": "black"});
	}
	else {
		console.log('die');
		snake.pop(); //pop out the head since it is illegal
		var erase = [tail];
		snake.forEach(function(ele) {
			erase.push(ele);
			snakeGrids.delete(ele);
		})
		io.sockets.emit('redraw', {"erase": erase, "append": []});
		delete snake;
	}
}

function getUnusedPlace() {
	while (true) {
		var pos = getRandomInt(0, BOARD_PARAMS.width * BOARD_PARAMS.height - 1);
		var posXY = posToXY(pos);
		if ( !snakeGrids.has(pos) &&
		) {
			for(var i = 0; i < SNAKE_LENGTH)
		}
	}
}

function canMove(posXY) {
	if (
		posXY.row < 0 ||
		posXY.col < 0 ||
		posXY.row >= BOARD_PARAMS.height ||
		posXY.col >= BOARD_PARAMS.width ||
		snakeGrids.has(posXY)
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



// var move=function(){
// 	var moveData=[];
// 	dbglobal.collection(collectName).find().toArray(function(err, allSnakes){
// 	if(err)
// 		console.log('err happend in setTimeout')
// 	else{
// 		  for(var m=0;m<allSnakes.length;m++){
// 		  	var status=track(allSnakes[m],allSnakes,allSnakes,collectName);
// 		  	var tail=allSnakes[m].pos.pop();
// 		  	// console.log(status);
// 		  	// if(status==-1){
// 		  	// 	dbglobal.collection(collectName).remove({'snakeName':allSnakes[m].snakeName});
// 		  	// 	moveData.push({'set':[],'unset':allSnakes.pos});
// 		  	// }
// 		  	if(status!=-1){
// 		  		head=allSnakes[m].pos[0]+wholeMove[status][0]*size+wholeMove[status][1];
// 		  		allSnakes[m].pos.splice(0,0,head);
// 		  		dbglobal.collection(collectName).update({'snakeName':allSnakes[m].snakeName},{'snakeName':allSnakes[m].snakeName,'pos':allSnakes[m].pos});
// 		  		moveData.push({'set':[head],'unset':[tail]});
// 		  	}
// 		  }
// 		  io.sockets.emit('moveSnake',moveData);
// 		  time=setTimeout(move,2000);
// 		}
// 	}
// 	)
// }
//
// //pos(int) first pos random
// function createSnake(len,snake,pos,allSnakes){
// 	if(len==0)
// 		return true;
// 	else if(!isLegal(pos,allSnakes)||touchSelfBody(snake,pos)){
// 		return false;
// 	}
// 	else{
// 		snake.push(pos);
// 		console.log(pos);
// 		var col=pos%size;
// 		var row=Math.floor(pos/size);
// 		if((col!=size-1 && createSnake(len-1,snake,pos+1,allSnakes))||(col!=0&&createSnake(len-1,snake,pos-1,allSnakes))||(row!=size-1&&createSnake(len-1,snake,pos+size,allSnakes))||(row!=0&&createSnake(len-1,snake,pos-size,allSnakes))){
// 			return true;
// 		}
// 		snake.pop();
// 		return false;
// 	}
// }
// function touchSelfBody(body,pos){
// 	for(var i=0;i<body.length;i++)
// 		if(body[i]==pos)
// 			return true;
// 	return false;
// }
// function isLegal(pos,docs){
// 	for(var i=0;i<docs.length;i++){
// 		var posArr=docs[i].pos;
// 		for(var j=0;j<posArr.length;j++){
// 			if(posArr[j]==pos){
// 				return false;
// 			}
// 		}
// 	}
// 	return true;
// }
//
// var eat=function(snake, prey,collectName){
// 	var moveData=[];
// 	while(prey.pos.length>0){
// 		snake.pos.splice(0,0,prey.pos.pop());
// 	}
// 	console.log('eatten happened');
// 	dbglobal.collection(collectName).remove({'snakeName':prey.snakeName });
// 	dbglobal.collection(collectName).update({'snakeName':snake.snakeName },{'snakeName':snake.snakeName,'pos':snake.pos });
// }
//
// var exist=function(snakeName,allSnakes){
// 	for(var i=0;i<allSnakes.length;i++){
// 		console.log(snakeName+' '+allSnakes[i].snakeName);
// 		if(snakeName==allSnakes[i].snakeName)
// 			return true;
// 	}
// 	return false;
// }
// var track=function(predator,preys,docs,collectName){
// 	var predRow=Math.floor(predator.pos[0]/size);
// 	var predCol=predator.pos[0]%size;
// 	var min=size+size+10;
// 	var prefPrey=-1;
// 	for(var i=0;i<preys.length;i++){
// 		if(predator.snakeName!=preys[i].snakeName&&predator.pos.length>preys[i].pos.length){
// 			var distance=Math.abs(predRow-Math.floor(preys[i].pos[0]/size))+Math.abs(predCol-preys[i].pos[0]%size);
// 			if(distance==1){
// 				eat(predator,preys[i],collectName);
// 				return -1;
// 			}
// 			if(distance<min){
// 				min=distance;
// 				prefPrey=i;
// 			}
// 		}
// 	}
//
// 	if(prefPrey==-1)
// 		return -1;
// 	var preyRow=Math.floor(preys[prefPrey].pos[0]/size);
// 	var preyCol=preys[prefPrey].pos[0]%size;
// 	var pref=[];
// 	if(predRow>=preyRow&&predCol<preyCol)
// 		pref=[2,1,0,3];//right,down,up,left
// 	else if(predCol>=preyCol&&predRow<preyRow)
// 		pref=[0,3,1,2];
// 	else if(predCol<preyCol&&predRow<preyRow)
// 		pref=[2,0,1,3];
// 	else
// 		pref=[1,3,0,2];
// 	console.log(pref);
// 	console.log(predator.pos);
// 	for(var i=0;i<pref.length;i++){
// 		var afterMoveRow=predRow+wholeMove[pref[i]][0];
// 		var afterMoveCol=predCol+wholeMove[pref[i]][1];
// 			if(afterMoveRow>=0&&afterMoveRow<size&&afterMoveRow>=0&afterMoveCol<size){
// 			var afterMovePos=afterMoveRow*size+afterMoveCol;
// 			if(isLegal(afterMovePos,docs))
// 				return pref[i];
// 		}
// 	}
// 	return -1;
// }



// receive user command to move
