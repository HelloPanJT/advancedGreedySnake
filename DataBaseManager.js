var MongoClient=require('mongodb').MongoClient;
var mongoURI='mongodb://ds057176.mlab.com:57176/today';
var db_user="panjintian";
var db_password="panjintian";
var collectName="AISnakeCollection";
var clientCollect="ClientCollection";
var msgCollection = "Messages";
var historyCollection = "userLog";

MongoClient.connect(mongoURI,function(err,db){
  if (err) {
	console.log('connect error');
  } else {
	db.authenticate(db_user,db_password,function(err,result){
	  if (err) {
	    throw err;
	  } else {

	  }
	});
  }
})