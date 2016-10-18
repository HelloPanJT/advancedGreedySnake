var socket=io.connect();
var username = "";
$(document).ready(function(){
	var size=20;

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

  socket.emit('createSnake',{'name': 'AISnake','len':10});
  socket.emit('createSnake',{'name':'client1','len':2});
	socket.emit('createSnake',{'name':'client2','len':2});
})

socket.on('message', function(data) {
    addMessage(data['message'], data['username']);
})

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

        if (val === "up")
        {
          socket.emit('up', "");
        }
				else if (val === "down")
        {
          socket.emit('down', "");
        }
				else if (val === "left")
				{
					socket.emit('left', "");
				}
				else if (val === "right")
				{
					socket.emit('right', "");
				}
        else {
          socket.emit('message', val);
        }
				addMessage(val, "Me");
        $('#msgText').val('')
    }
}




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
