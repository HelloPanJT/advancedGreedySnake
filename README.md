# Module 2 group project #
__Submitted by:__ Today

__Team members:__
````
Nanxiang Zhang  : zhan4584@umn.edu
Jintian Pan     : panxx389@umn.edu
Gloria Zhang    : zhan2209@umn.edu
Zheng Sun       : sunxx738@umn.edu
````

__Heroku URL:__ https://advancedgreedysnakelast.herokuapp.com/

## Argument of ambition:
_Briefly argue why this was a technically ambitious project_
<!---
1. This game can include many people, every person controls a colored snake. When two snakes hit head by head, the snake who attacks first (move first) will win this battle. When one snake's head hits other snake body, the first snake will go die.
2. There are several AI snakes (the number of them can be configured when starting the system). The AI snakes won't eat user's snake actively, they just stop users from eating food. The maximum number of AI snakes are fixed, but it will increase as new player join in and this will continue until the number of snake satisfies the maximum number. The behavior of AI snakes is interesting. The concept looks like this: for each user snake, it has a lock. No matter which AI snake gets this lock, that AI snake will have right to chase this user snake. Of course, the AI snake won't eat this user snake actively. After chasing several steps, this AI snake will give up this user snake. Then this AI snake will randomly move several steps and then it will check if it can get another user snake. The collision between AI snakes and user snakes is the same as collision between user snakes.
3. The leading board will be flush dynamically, which is based on the snake's length. Also, we have a chat room. We also has a statics board to display the player's history data.  
-->

###### 1. AI snake
  We designed the AI snake, which is automatic created by our program. Using the short path algorithm, the AI snake will calculate the shortest path to kill the User snake. The AI snake will improve the Playability of our game.  And there are several interesting functions for our AI snake:
* The purpose of AI snake is to kill the User snake. Once the User snake's head touch the body of AI snake, the User snake will die. So does the AI snake.
* The AI snake will give up and seek a new User snake to kill. If the AI snake didn't kill its target User snake within 30-steps, it will walk around 5 circles and pick the other User snake randomly.
* The AI snake will only try to kill the User snake which is targeted by the other AI snake.

###### 2. User name detected
  We detect the username input. If the new comer input the same username with any current user in the game, the new comer will receive a alert to ask them to try the other username.

###### 3. Multiple user with colorful snake
  We define a database store some color properties. When the new user into the play model, they will get a snake with a random color. In this case, different users will have different color snake. This is easy for the users to tell Relations between the enemy and the friends. Also this makes the game board UI more friendly.

###### 4. Watching model  [<b> Two</b> steps watching]
  We defined two watching model, which is easier for the users to watch in both way:
* The first watching model (for new user): Once user open our [game board](https://advancedgreedysnakelast.herokuapp.com/) , they will under the 1st watching model. In this case, users especially new comer, they don't need to do anything, but watching the current game.
* The second watching model (for current/old user):
  <br> <b>1.</b> Once after the user input their username, they will under the 2nd watching model.
  <br> <b>2.</b> Once the user snake died, they will under the second watching model.
  <br> In this case, the old user they can still stay and watch the game even they've already died and also if they still not decided join the game or not, they won't be kicked out of the game chat room.
###### 5. Statistic model [<b>Sorted</b> score board]
  We made the Statistic model as a "Highest score board". Once the user snake died, their final score will be recorded into our database. And sorted automatic by the "length" property.
###### 6. Seven API
  We will give more detail about this part in API.md


## Argument of execution:
_Briefly argue why this was a well executed project_

###### 1. Open our [game board](https://advancedgreedysnakelast.herokuapp.com/)

You will see there are several food and one(or two) AI snake already in the play area, they just walk back and force without any targets. But pay attention to the following rules:
* The AI snake won't eat food, won't get longer.
* The longer snake can eat the shorter snake when they touched head-by-head.
* The AI snake could be eaten by the User snake.
* The User snake can be killed by the AI snake, and the AI snake can be killed by the User snake.
* The AI snake will try to kill User snake, but won't eat the User snake.
* The snake which touches the other snake's body, it will die.
* The more "food" the snake eat, the longer the snake will be.

###### 2. Set Username
* The user can input any username but not the same with the username in the same game board. The length of username could be [1,+∞].
* If you input a username and receive the alert, just go ahead to input the other new username.

##### 3. Chat room
* The user can input the word "play"(must in lower case) to create a new snake to start the game.
* The user can chat use the chat room, just type any words, but not a single "play".
* The chat room will keep the chat history, the user can scroll up to check the previous chat history.

##### 4. End of game
  Once the snake die, the current round for the current user ends. If the user still want to play, they can just input "play" to create a new snake with another color. Game will be end in the following cases:
* Eaten by the other User snake, game end.
* Hit the other snake's body, game end.
* Hit the border, game end.
* Refresh the page will also make your current game end, but it will bring you back to the watching model, which is the same with the start game board. 

<!--
All functionalities described above have been implemented. We have tested it with some people, and the people enjoy the game. After testing, we didn't found bugs.
-->

## Description ##
For this module you will be making a multi-user, online game using Express,
WebSockets, and MongoDB. Your final product will need to have these components:

- An API that can be used to get information about the current state of the
  the game and post moves to the game. This will be how the game can be played.
- A view to watch the game in real time.
- A statistics page for the game.

### What constitutes a game? ###
Google says that the definition of "game" is "a form of play or sport" and who
are we to argue with Google. You could do something relatively simple like
[Twitch Plays Tic-tac-toe](https://en.wikipedia.org/wiki/Twitch_Plays_Pok%C3%A9mon)
to something as complicated as your own
[MUD](https://en.wikipedia.org/wiki/MUD). It doesn't need to be elaborate or
highly visual.

### API: Playing the game ###
You need to write an web API that will let people easily write clients to play your
game. Suppose our game is [tug-of-war](https://en.wikipedia.org/wiki/Tug_of_war).
Then I would want to be able to get `/rope-position` for information about the
current position of the rope in
[JSON format](https://en.wikipedia.org/wiki/JSON) and post to `/pull-on-left`
or `/pull-on-right` to affect the state of the game.

You will need to develop a set of tools, scripts, or code that will test and
demonstrate the capabilities of your API. You can use whatever languages you
want to accomplish this. Both
[node.js](http://stackoverflow.com/questions/5643321/how-to-make-remote-rest-call-inside-node-js-any-curl/5643366#5643366)
and
[python](http://stackoverflow.com/questions/4476373/simple-url-get-post-function-in-python)
are capable of this. There is a good chance your favorite language can do it
also.

If you just want to poke at your API a little bit you can use tools like
[Postman](https://www.getpostman.com/) and
[Advanced REST client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo?hl=en-US)
as in browser options or
[curl](https://curl.haxx.se/docs/manpage.html) on the command line.
Curl has the benefit that it is available on almost all systems.

### Watching the game ###
Create a view for spectators. Your players will be interacting via your API,
but you should also have a way for spectators to watch via a webpage. This
should update in real time, so you will need to use WebSockets to push
events out to the UI.

What you display here is up to your own judgment, just make sure it is
something worth watching. If you were doing tic-tac-toe, I would want to watch
as the board fills up. If you were doing hangman, I would want to see the
gallows being built. You don't need fancy graphics, just provide some way of
conveying action.

Other potential options:

- twitter-like stream of events
- scoreboard
- live-updating charts


### Stats overview ###
The final requirement is some statistics web page for the game. This can be
displaying the number of times a person took a specific action, the amount of
time that it took a game to finish, et cetera. Show any statistics that you
think would be interesting for your specific game. You can make this static or
use web sockets to update content live here.

## Setting up your database ##
Someone from each group should create an account with [mLab](https://mlab.com/)
and setup a free sandbox database. This will be the database you should use for
your project. __If you want to connect from inside the UMN you should send us
the URI they gave you.__ We will then send you back a URI you can use to
connect.

### The reasoning (in case you want to know) ###
The reason you need to do this is that the UMN network blocks certain outgoing
ports. These are also the ports that mLab uses to let you connect. We have a
server outside of UMN that listens on ports that are not blocked and will
forward your traffic on to mLab.

## Submission ##
- Your code should be pushed up to your repo on github
- Fill this `README.md` out with your team name, team members' emails, and
  Heroku url for your demo. Additionally, complete the argument sections at the
  top of the file.
- Create a file called `API.md` that documents your api endpoints and how to
  use them. These should include a valid `curl` command and a description of its
  expected output.

## Grading ##
You will be graded on the __ambition__ and __execution__ of the project. At
the top of this `README.md` you have the opportunity to argue why your
submission was ambitious and well executed. In order for us to grade it, you
must have it hosted on Heroku. To earn an "A" grade, a project must be
technically ambitious, well-executed, and polished. To earn a passing grade, a
project must minimally fulfill the three requirements listed in the description.
