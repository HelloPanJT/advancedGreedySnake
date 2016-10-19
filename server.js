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
var allSnakes = {};
var chessBoard = {};
var boardParams = {"height": 40, "width": 60};
var gridOccupied = new Set(); //not include the food, only snake

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
					res.send(boardParams);
				});
				app.post('/move', function(req,res){
					res.send('success');
				});
				app.post('/play', function(req,res){
					initialSnake(req.username, io);
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
	gridOccupied.add(pos);
	allSnakes.username = [pos];
	io.sockets.emit('redraw', {"erase": [], "append": Array.from(gridOccupied), "color": "black"});
}

function moveSnake(username, cmd, io) {
	var nextPos = 0;
	var snake = allSnakes.username;
	var head = snake[snake.length-1];

	if (cmd == "u") {
		nextPos = head - boardParams.width;
	} else if (cmd == "d") {
		nextPos = head + boardParams.width;
	} else if (cmd == "l") {
		nextPos = head - 1;
	} else {
		nextPos = head + 1;
	}
	snake.push(nextPos);
	var tail = snake.shift()
	gridOccupied.delete(tail);

	if (canMove(nextPos)) {
		gridOccupied.add(nextPos);
		io.sockets.emit('redraw', {"erase": [tail], "append": [nextPos], "color": "black"});
	}
	else {
		delete snake;
	}
}

function getUnusedPlace() {
	while (true) {
		var pos = getRandomInt(0, boardParams.width * boardParams.height - 1);
		if ( !gridOccupied.has(pos) &&
			!gridOccupied.has(pos - 1) &&
			!gridOccupied.has(pos + 1) &&
			!gridOccupied.has(pos + boardParams.height) &&
			!gridOccupied.has(pos - boardParams.height)
		) {
			return pos;
		}
	}
}

function canMove(pos) {
	var posXY = posToXY(pos);
	if (
		posXY.row < 0 ||
		posXY.col < 0 ||
		posXY.row >= boardParams.height ||
		posXY.col >= boardParams.width ||
		gridOccupied.includes(posXY)
	) {
		return false;
	}
	return true;
}

function posToXY(pos) {
	var col = pos % boardParams.width;
	var row = Math.floor( pos / boardParams.width);
	return {"row": row, "col": col};
}

function xyToPos(row, col) {
	return (row * boardParams.width + col);
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
