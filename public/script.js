var socket=io.connect();
var username = "";
var directions = ["u", "d", "l", "r"];

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

  //socket.emit('createSnake',{'name': 'AISnake','len':10});
  //socket.emit('createSnake',{'name':'client1','len':2});
})

socket.on('message', function(data) {
  addMessage(data['message'], data['username']);
})

socket.on('redraw', function(data) {
	console.log(data);
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

        if (directions.includes(val))
        {
					$.post("/move", {"direction": val, "username": username}, function(result){
						console.log(result);
					});
        }
				else if (val === "play") {
					$.post("/play", {"username": username}, function(result){
						console.log(result);
					});
				}
        else {
          socket.emit('message', val);
        }
				addMessage(val, "Me");
        $('#msgText').val('');
    }
}

function xyToPos(row, col, width) {
	return (row*width + col);
}

function setGridColor(pos, color) {
	$('#'+pos).css('background-color', color);
}


socket.on('redrawQipan',function(allSnakes){
		inital();
		console.log('redrawQipan received');
		for(var i=0;i<allSnakes.length;i++)
			for(var j=0;j<allSnakes[i].pos.length;j++){
				set(allSnakes[i].pos[j],'black');
		}
})


//create a snake
socket.on('status', function(data) {
	console.log('create sucess terminal');
	if(data['code']=='101')
		$('#status').html('sucess');
	else
		$('#status').html('fail to create Snake');
})

socket.on('moveSnake',function(data){
	for(var i=0;i<data.length;i++){
		for(var j=0;j<data[i]['set'].length;j++)
			set(data[i]['set'][j],'black');
		for(var j=0;j<data[i]['unset'].length;j++)
			set(data[i]['unset'][j],'white');
	}
})
// socket.on('redrawQipan',function(allSnakes){
// 		inital();
// 		console.log('redrawQipan received');
// 		for(var i=0;i<allSnakes.length;i++)
// 			for(var j=0;j<allSnakes[i].pos.length;j++){
// 				set(allSnakes[i].pos[j],'black');
// 		}
// })

function set(pos,color){
	var col=pos%size;
	var row=Math.floor(pos/size);
	var selector='#qipan tr:eq('+row+')'+' td:eq('+col+')';
	$(selector).css('background-color',color);
}
function inital(){
	for(var i=0;i<size;i++)
		for(var j=0;j<size;j++){
			set(i*size+j,'white');
		}
}
