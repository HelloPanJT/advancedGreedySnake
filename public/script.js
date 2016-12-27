var socket = io.connect();
var username = "";
var directions = {"37": "left", "38": "up", "39": "right", "40": "down"};

$(document).ready(function(){
  initChessBoard();
  bJoin();
  $("#userNameRow").hide();
  $("#sendMsgRow").hide();
  $("#setUserNameBtn").click(function() {setUsername();});
  $("#sendMsgBtn").click(function() {sendMessage();});
  $("#userNameText").keypress(function(event){
    if (event.keyCode == '13'){
	  event.preventDefault();
      setUsername();
    }
  });

  $("#msgText").keypress(function(event){
	if (event.keyCode == '13') {
	  event.preventDefault();
	  sendMessage();
	}
  });
});

function bJoin() {
  $.post("/getCurBoard", {}, function(result) {
  })
}

$(document).keydown(function(event) {
  var key = event.keyCode;
  if (directions[key]) {
    $.post("/move", {"cmd": directions[key], "username": username}, function(result){
	});
  }
});

socket.on('clearstatus', function(data) {
  if (data == username) {
		$("#snakeLength").text("");
		$('#snakeColor').html("");
	}
});

socket.on('message', function(data) {
  addMessage(data['message'], data['username']);
})

socket.on('redrawLeaderBorder',function(data){
  data.sort(comparator);
  for (var i = 0; i < 3; i++) {
	$("#no"+(i+1)+"username").text("");
	$("#no"+(i+1)+"length").text("");
  }
  for (var i = 0; i < Math.min(data.length, 3); i++){
	if (data[i].name == username){
	  $("#snakeLength").text(data[i].length);
	  paintSnake(data[i].color);
	}
	$("#no"+(i+1)+"username").text(data[i].name);
	$("#no"+(i+1)+"length").text(data[i].length);
  }
});

function paintSnake(color){
	$('#snakeColor').html("");
	$('#snakeColor').append("<div style='margin-top: 8px; height:20px; background-color:"+ color + ";'/>");
}

socket.on('redraw', function(data) {
  if (data.erase.length != 0) {
	data.erase.forEach(function(ele) {
	  setGridColor(ele, 'black');
    })
  }
  if (data.append.length != 0) {
	data.append.forEach(function(ele) {
	  setGridColor(ele, data.color);
    })
  }
})

function initChessBoard() {
  $.post("/init", function(result){
    var board = $('#chessBoard');
	var tbContent = "";
	for (var row = 0; row < result.HEIGHT; row++) {
	  tbContent += '<tr>';
	  for (var col = 0; col < result.WIDTH; col++){
		var pos = xyToPos(row, col, result.WIDTH);
		tbContent += '<td id="' + pos +'"></td>';
	  }
	tbContent+='</tr>';
	}
    board.append(tbContent);
  });
  scrollToBottom();
}

function scrollToBottom() {
  var element = document.getElementById("chatroom");
  element.scrollTop = element.scrollHeight;
}

function setUsername() {
  if ($("#userNameText").val() != "") {
	$.post("/setUsername", {"username": $("#userNameText").val()}, function(result){
	  if (result) {
		username = $("#userNameText").val();
		$('#username').text(username);
		$('#sendMsgRow').show();
		$("#userNameRow").show();
		$('#setUserNameRow').hide();
		$('#userSet').hide();
		socket.emit('setUsername', username);
	  } else {
		alert('Try another name! :D');
		$("#userNameText").val("Try another name!");
		}
	});
  }
}

function addMessage(msg, username) {
  $("#chatroom").append('<p>' + username + ' : ' + msg + '</p>');
  scrollToBottom();
}

function sendMessage() {
  if ($('#msgText').val() != "") {
    var val = $('#msgText').val();
	if (val === "play") {
	  $.post("/play", {"username": username}, function(result){
	  	if (result == 'nameDup') {
	  	  alert('name already exist');
	  	} else if (result == 'crowded') {
	  	  alert('the room is too crowded');
	  	}
	  });
	} else {
	  $.post("/message", {"username": username, "message": val}, function(result){
	  });
    }
    $('#msgText').val('');
    $('#msgText').blur();
  }
}

function xyToPos(row, col, width) {
  return (row*width + col);
}

function setGridColor(pos, color) {
  $('#'+pos).css('background-color', color);
}

function comparator(a,b){
  return b.length-a.length;
}
