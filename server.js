const Hapi = require('hapi');
const server = new Hapi.Server();

server.connection({port:80});
const io = require('socket.io')(server.listener);

server.register(require('inert'), (err)=>{
    if(err){
        throw err;
    }

server.route({
    method: 'GET',
    path: '/{path*}',
    handler:  {
          directory: {
              path: './pub',
              index: true
          }
      }
});

server.start(()=>{
    console.log("Running at ", server.info.uri);
});
});

const players = {};
let otherPlayer = null;

const wordList = {
    
    beg: ['fizz', 'buzz', 'cat', 'dog','lie','joke','ape','jeep','aqua',
            'pack','bat','bad','boa','mop','pad','camp','icky','jars','hymn',
            'deck','kiwi','verb','word','noun','gulf','dunk','five','film','pike','sick'],
    int: ['pizza','dizzy','quick','juice','chimp','check','clock',
            'house','proxy','wimpy', 'amazed','apples','amulet','genius','hotdog',
            'leaves','mammal','outbox','parley',''],
    adv: ['abandon','decrypt','eyebrow','forearm','samurai',
              'aardvark','bungalow','coleslaw','crayfish','mulberry']
}
              
const getPlayerOne = (socket) => {
    players[socket.id] = {challenger: otherPlayer, ingame: 'A', socket: socket};
    if(otherPlayer){
        players[socket.id].ingame = 'B';
        otherPlayer = null;
    }
    else{
        otherPlayer = socket.id;
    }
    console.log('Player one joined the server.');
}

const getPlayerTwo = (socket) => {
    if(!players[socket.id].challenger){
        return;
    }
    return players[players[socket.id].challenger].socket;
}

const scrambledWord = (word) => {
  		let scrambledWord = '';
 	 	let charIndex = 0;
  		word = word.split('');
  		while (word.length > 0) {
    		charIndex = word.length * Math.random() << 0;
    		scrambledWord += word[charIndex];
    		word.splice(charIndex, 1);
  		}
  		return scrambledWord;	
}

io.on('connection', (socket)=>{
    console.log('someone connected to server.');
    
    socket.on('disconnect', (socket)=>{
        console.log("Someone disconnected from server.");       
    });
     
    getPlayerOne(socket);
    if(getPlayerTwo(socket)){
        socket.emit('startGame', {ingame: players[socket.id].ingame});
        getPlayerTwo(socket).emit('startGame', {ingame: players[getPlayerTwo(socket).id].ingame});   
        console.log('Player two joined the server.');
    }
    
    socket.emit('wordList', wordList);
    
    socket.on('chosenWord', (data)=>{
       const encryptedWord = scrambledWord(data.word)
       console.log(encryptedWord);
       const obj = {};
       obj.eWord = encryptedWord;
       obj.oWord = data.word;
       io.emit('sendWord', obj);
    });
    
    socket.on('sendLetter', (letter)=>{
       console.log("word guessed: ",letter.l);
       io.emit('getLetter', letter.l);
    });
    socket.on('isWord', (word)=>{
        if(word.correct === word.guessed){
          io.emit('displayWin', word.guessed);
          console.log(word.guessed + " is: " + word.correct);	
        }else{
            io.emit('displayLoss', word.guessed);
            console.log(word.guessed + " is not: " + word.correct);
        }
    });
       
});