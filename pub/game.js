

const socket = io('http://localhost:80');

var ready = () => {
	
	const hideInput = ()=>{
		document.getElementById('twoView').style.display="none";
	}
	
	const hidePlayerOneView = ()=>{
		document.getElementById('options').style.display='none';
	}
	
	const showInput = ()=>{
		document.getElementById('twoView').style.display="block";
	}

	const clearTextArea = ()=>{
		document.getElementById('textArea').innerHTML = " ";
	}
	
	const clearLetterGuess = ()=>{
		document.getElementById('guessWord').innerHTML = " ";
	}

	const selectedWords = (word)=>{
		const board = document.getElementById('textArea');
		board.innerHTML = board.innerHTML + word + " ";
	}

	const displayEasy = (wordList) => {
		const easy = document.getElementById('easy');
		easy.addEventListener('click', ()=>{
			clearTextArea();
			wordList.forEach(selectedWords);
		});
	}

	const displayMedium = (wordList)=>{
		const medium = document.getElementById('medium');
		medium.addEventListener('click', ()=>{
			clearTextArea();
			wordList.forEach(selectedWords);
		});
	}

	const displayHard = (wordList)=>{
		const hard = document.getElementById('hard');
		hard.addEventListener('click', ()=>{
			clearTextArea();
			wordList.forEach(selectedWords);
		});
	}

	const getWord = (words)=>{	
		const theWord = document.getElementById('chooseWord');
		theWord.addEventListener('click', ()=>{
			const chosenWord = document.getElementById('wordInput').value;
			const wordIndex = words.indexOf(chosenWord);
			if(wordIndex !== -1){
				const obj = {};
				obj.word = chosenWord;
				socket.emit('chosenWord', obj);
				hidePlayerOneView();
			}else{
				alert('chose a valid word from above');
			}
		});
	}
	
	const guessWord = ()=>{
		clearLetterGuess();
		const sendWord = document.getElementById('enterLetter');
		sendWord.addEventListener('click',()=>{
			const getWord = document.getElementById('guessWord').value;
			const word= {l:getWord};
			console.log(word);
			socket.emit('sendLetter', word);
			clearLetterGuess();
		});
	}
	
	const isWord =(correctWord)=>{
		console.log(correctWord);
		socket.on('getLetter', (guessWord)=>{
			console.log("word chosen by player two: ", guessWord);
			const obj = {};
			obj.guessed = guessWord;
			obj.correct = correctWord;
			socket.emit('isWord', obj);
		});
	}
	
	const play = (aPlayer) =>{
		
		if(aPlayer==="A"){
			socket.on('sendWord',(data)=>{
				document.getElementById('showWord').innerHTML = "The encrypted word is: " + data.eWord;
				isWord(data.oWord);
			});
			socket.on('getLetter',(data)=>{
				socket.on('displayWin', (correctWord) => {
					document.getElementById('results').innerHTML = "Player B decrypted the word. You Lose.";			
				});
				socket.on('displayLoss',(data)=>{
					document.getElementById('results').innerHTML = "Player B failed to decrypt the word. You win.";
				});
			});
		} 
		
		
		else{
			showInput();
			document.getElementById('options').style.display = 'none';
			socket.on('sendWord',(data)=>{
				document.getElementById('showWord').innerHTML = "The encrypted word is:  " + data.eWord;
				isWord(data.oWord);
				hidePlayerOneView();
			});
			socket.on('getLetter',(data)=>{
				socket.on('displayWin', (correctWord) => {
					document.getElementById('results').innerHTML = "Player B decrypted the word. You win.";			
				});
				socket.on('displayLoss',(data)=>{
					document.getElementById('results').innerHTML = "Player B failed to decrypt the word. You lose.";
				});
			});
		}
	}

	socket.on('wordList', (words)=>{
		displayEasy(words.beg);
		displayMedium(words.int);
		displayHard(words.adv);
		const allWords = words.beg.concat(words.int, words.adv);
		getWord(allWords);
	});

	socket.on('startGame', (data)=>{
		ingame = data.ingame;
		play(ingame);
		document.getElementById('wordInput').innerHTML=" ";
		document.getElementById('inGame').innerHTML = "You are player: " + ingame;
	});

	hideInput();
	guessWord();

}

if (document.readyState !== 'loading') {
  ready()
} else {
  document.addEventListener('DOMContentLoaded', ready)
}


