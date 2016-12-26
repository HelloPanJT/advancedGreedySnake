var MongoClient=require('mongodb').MongoClient;
var express=require('express');
var app=express();
var bodyParser = require('body-parser');
var mongoURI='mongodb://ds057176.mlab.com:57176/today';
var db_user="panjintian";
var db_password="panjintian";
var collectName="AISnakeCollection";
var clientCollect="ClientCollection";
var msgCollection = "Messages";
var historyCollection = "userLog";
const BOARD_PARAMS = require('./BoardParams').boardParams;
var Executor = require('./Executor').Executor;
const commandsc = require('./CommandSC').CommandSC;

MongoClient.connect(mongoURI,function(err,db){
  if (err) {
	console.log('connect error');
  } else {
	db.authenticate(db_user,db_password,function(err,result){
	  if (err) {
	    throw err;
	  } else {
	    app.use(express.static('public'));
	    app.set('view engine','ejs');
	    app.use(bodyParser.json());
	    app.use(bodyParser.urlencoded({ extended: true }));
	    var port = process.env.PORT||5002;
	    var server = app.listen(port,function(){
					   console.log('listen on 5002');
				     });
	    var io = require('socket.io').listen(server);
        var ExecutorInst = new Executor(io);

        io.sockets.on('connection', function(socket) {
          socket.on('setUsername', function(data) {
            socket.username = data;
          })
          socket.on('disconnect', function() {
            var username = socket.username;
            ExecutorInst.execute(commandsc.DELETE_USERNAME, username);
          })
        });

	    app.get('/',function(req,res) {
		  db.collection(msgCollection).find().toArray(
		    function(err, allMessages) {
			  res.render('index', {'messages': allMessages});
		    }
		  )
		});

		app.post('/getCurBoard', function(req, res) {
		  ExecutorInst.execute(commandsc.GET_CURRENTDATA);
		  res.send('returning current board data');
		})

		app.post('/init', function(req,res){
		  res.send(BOARD_PARAMS);
		});
        
		app.post('/move', function(req, res) {
		  ExecutorInst.execute(commandsc.CHANGE_DIR, req.body.username, req.body.cmd);
		  res.send('changing direction');
		});

		app.post('/setUsername', function(req, res) {
		  var status = ExecutorInst.execute(commandsc.CHECK_USERNAME, req.body.username);
		  res.send(!status);
		})

		app.post('/play', function(req, res) {
		  if (ExecutorInst.execute(commandsc.CREATE_SNAKE, req.body.username)) {
		  	res.send('success');
		  } else {
            res.send('fail');
		  }
		})
	  }
	});
  }
})












