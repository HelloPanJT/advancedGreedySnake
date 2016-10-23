var socket=io.connect();
var username = "";
var directions = {"37": "left", "38": "up", "39": "right", "40": "down"};

$(document).ready(function(){
	var size=20;

	initChessBoard();
	$("#userNameRow").hide();
	$("#sendMsgRow").hide();

	$("#setUserNameBtn").click(function() {setUsername();});
	$("#sendMsgBtn").click(function() {sendMessage();});
	$("#userNameText").keypress(function(event){
    if(event.keyCode == '13'){
			event.preventDefault();
      setUsername();
    }
	});
	$("#msgText").keypress(function(event){
		if(event.keyCode == '13'){
			event.preventDefault();
			sendMessage();
		}
	});
})

$(document).keydown(function(event) {
    var key = event.keyCode;
		if (directions[key]) {
			$.post("/move", {"cmd": directions[key], "username": username}, function(result){
				console.log(result);
			});
		}
});

socket.on('message', function(data) {
  addMessage(data['message'], data['username']);
})

socket.on('redraw', function(data) {
	if (data.erase) {
		data.erase.forEach(function(ele) {
			setGridColor(ele, 'white');
		})
	}
	if (data.append) {
		data.append.forEach(function(ele) {
			setGridColor(ele, data.color);
		})
	}
})
socket.emit('createAISnake',{});
function initChessBoard() {
	$.post("/init", function(result){
		var board = $('#chessBoard');
		var tbContent = "";
		for(var row = 0; row < result.height; row++) {
			tbContent += '<tr>';
				for(var col = 0; col < result.width; col++){
					var pos = xyToPos(row, col, result.width);
					tbContent += '<td id="' + pos +'"></td>';
				}
			tbContent+='</tr>';
		}
		board.append(tbContent);
	});
}

function setUsername() {
  if ($("#usernameInput").val() != "")
  {
		username = $("#userNameText").val();
		$('#username').text(username);
		$('#sendMsgRow').show();
		$("#userNameRow").show();
		$('#setUserNameRow').hide();
		$('#userSet').hide();
    socket.emit('setUsername', username);
  }
}

function addMessage(msg, username) {
    $("#chatroom").append('<p>' + username + ' : ' + msg + '</p>');
}

function sendMessage() {
    if ($('#msgText').val() != "")
    {
        var val = $('#msgText').val();
				if (val === "play") {
					$.post("/play", {"username": username}, function(result){
						console.log(result);
					});
				}
        else {
          socket.emit('message', val);
        }
				addMessage(val, "Me");
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
