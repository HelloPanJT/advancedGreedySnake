$(document).ready(function(){
var size=20;
var socket=io.connect();
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
socket.on('redrawQipan',function(allSnakes){
		inital();
		console.log('redrawQipan received');
		for(var i=0;i<allSnakes.length;i++)
			for(var j=0;j<allSnakes[i].pos.length;j++){
				set(allSnakes[i].pos[j],'black');
		}
})
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
$(function() {
    socket.emit('createSnake',{'name': 'AISnake','len':10});
    socket.emit('createSnake',{'name':'client1','len':1});
})
     }
)
