# API Documentation

We have implemented <b><u>seven API</u></b> here

````
curl --data '' http://advancedgreedysnakelast.heroku.com/init
````

For the url __/init__ we can get the size of the chessBoard, like __{"height":45,"width":55}__ advancedgreedysnakelast

````
curl --data '' http://advancedgreedysnakelast.heroku.com/createAISnake
````

For the url __/createAISnake__ we can get whether we create a AI snake successfully. We can get __success__ or __AI Snake Max__

````
curl --data '' http://advancedgreedysnakelast.heroku.com/getLeaderBorder
````

For the url __/getLeaderBorder__ we can get whether we get leader board successfully. We can get __Leaderboard get success__ for response

````
curl -X POST -H "Content-Type:application/json" -d '{"username":"aaa"}' http://advancedgreedysnakelast.heroku.com/setUsername
````

For the url __/setUsername__ we can get whether we set username successfully. We can get __set username fail__ or __set username success__

````
curl -X POST -H "Content-Type:application/json" -d '{"username":"aaa", "cmd":"down"}' http://advancedgreedysnakelast.heroku.com/move
````

For the url __/move__ we can get whether we move the snake successfully. We can get __move success__ or __move failed__

````
curl -X POST -H "Content-Type:application/json" -d '{"username":"aaa"}' http://advancedgreedysnakelast.heroku.com/play
````
For the url __/play__ we can get whether we initialize the snake successfully. We can get __init snake success__ or __init snake fail__

````
curl -X POST -H "Content-Type:application/json" -d '{"username":"aaa", "message":"test"}' http://advancedgreedysnakelast.heroku.com/message
````

For the url __/message__ we can get whether we send the message successfully. We can get __message update success__
