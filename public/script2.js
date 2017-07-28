let magicWord = document.querySelector('#magic-word');
let answerLetters = document.querySelectorAll('.word-letter');
let numOfGuessesRemaining = document.querySelector('#numOfGuessRemaining');
let message = document.querySelector('#message');
let counterDiv = document.querySelector('#counter-div');
let blanks = '';
let guessesRemaining = 8;
let guessHistory = [];

numOfGuessesRemaining.textContent = guessesRemaining;

answerLetters.forEach(function(letter) {
});

magicWord.textContent = blanks;

function replaceLetter(letter) {
  let blanksArr = blanks.split('');
  for (let i = 0; i < splitWord.length; i++) {
    if (letter === splitWord[i]) {
      blanksArr[i] = letter;
      blanks = blanksArr.join('');
      magicWord.textContent = blanks;
    }
  };
}

function doesItMatch(letter) {
  let blanksArr = blanks.split('');
  for (let i = 0; i < splitWord.length; i++) {
    if (letter.toUpperCase() === splitWord[i]) {
      return true;
    }
  }
  return false;
}

function hasGuessedIt(letter) {
  for (let i = 0; i < guessHistory.length; i++) {
    if (guessHistory[i] === letter) {
      return true;
    }
  }
  return false;
}

function showAnswer() {
  let blanksArr = blanks.split('');
  for (let i = 0; i < blanksArr.length; i++) {
    if (blanksArr[i] === '_') {
      blanksArr[i] = letter;
      blanks = blanksArr.join('');
      magicWord.textContent = blanks;
    }
  };
}

window.addEventListener('keypress', (e) => {
  if (guessesRemaining > 0) {
    let guess = e.which || e.keyCode;
    let letterGuess = String.fromCharCode(guess).toUpperCase();
    if (hasGuessedIt(letterGuess)) {
      message.textContent = 'You already guessed this letter.';
    } else {
      guessHistory.push(letterGuess);
      message.textContent = '';
      if (doesItMatch(letterGuess)) {
        replaceLetter(letterGuess);
      } else {
        guessesRemaining--;
        numOfGuessesRemaining.textContent = guessesRemaining;
        if (guessesRemaining === 0) {
          counterDiv.innerHTML = '<h1>GAME OVER!!!</h1>';
          showAnswer();
        }
      }
    }
  }
});
