var express=require('express');
var app=express();
var bodyParser = require('body-parser');
const BOARD_PARAMS = require('./BoardParams').boardParams;
var Executor = require('./Executor').Executor;
const commandsc = require('./CommandSC').CommandSC;

var startServer = function() {
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
    res.render('index');
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
    var status = ExecutorInst.execute(commandsc.CREATE_SNAKE, req.body.username);
  	res.send(status);
  })

  app.post('/message', function(req, res){
    ExecutorInst.execute(commandsc.SEND_MESSAGE, 
                         {message: req.body.message, 
                          username: req.body.username});
  })
}

startServer();














