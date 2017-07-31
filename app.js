const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      fs = require('file-system'),
      // mongoose = require('mongoose');
      mustacheExpress = require('mustache-express'),
      randomWords = require('random-words'),
      words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

let port = process.env.PORT || 3000;

// mongoose.connect('mongodb://localhost/hangman');
//
// let winnerSchema = new mongoose.Schema({
//   name: String,
//   image: String,
//   score: Number
// });
//
// let Winner = mongoose.model('Winner', winnerSchema);

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'something'
}));

app.get('/', (req, res) => {

  function getNewWord(min, max) {
    req.session.word = randomWords().toUpperCase().split('');
    if (req.session.word.length < min || req.session.word.length > max) {
      getNewWord(min, max);
    }
  }

  if (req.session.difficultyChosen === false) {
    req.session.beginGame = false;
  };

  if (req.session.beginGame === true) {
    if (req.session.difficulty === 'easy') {
      getNewWord(4, 6);
    } else if (req.session.difficulty === 'medium') {
      getNewWord(6, 8);
    } else {
      getNewWord(8);
    }
    req.session.beginGame = false;
    req.session.playing = true;
    // req.session.didWin = false;
    req.session.blankArr = [];
    req.session.word.forEach(function(letter) {
      req.session.blankArr.push('_');
    });
    req.session.blanksRemaining = req.session.blankArr.length;
    req.session.correctCount = 0;
    req.session.incorrectCount = 0;
    req.session.guesses = [];
    req.session.guessesRemaining = 8;
    req.session.alreadyGuessed = false;
    req.session.errorMessage = '';
  }
  console.log(req.session);

  function clearGame() {
    req.session.playing = false;
    req.session.word = '';
  }

  if (req.session.blanksRemaining === 0) {
    req.session.gameOverMsg = `You win! Do you want to play again?`;
    // req.session.didWin = true;
    clearGame();
  }

  if (req.session.guessesRemaining === 0) {
    let answer = req.session.word.join('');
    req.session.gameOverMsg = `You lose. The word was ${ answer }.`;
    clearGame();
  }

  res.render('index', req.session);

});

app.post('/guess', (req, res) => {
  let userInput = req.body.guess.toUpperCase();

  function isLetter(input) {
    let letter = /^[A-Z]+$/;
    if (input.match(letter)) {
      return true;
    } else {
      return false;
    }
  };

  if (isLetter(userInput)) {
    req.session.errorMessage = '';
  } else {
    req.session.errorMessage = 'Please enter a letter';
    res.redirect('/');
  }

  function showAnswer() {
    for (let i = 0; i < answer.length; i++) {
      if (userInput === answer[i]) {
        req.session.blankArr[i] = answer[i];
      }
    };
  }

  function alreadyGuessed() {
    for (let i = 0; i < req.session.guesses.length; i++) {
      if (req.session.guesses[i] === userInput) {
        return true;
      }
    }
    return false;
  };

  if (alreadyGuessed()) {
    req.session.alreadyGuessed = true;
    res.redirect('/');
  } else {
    req.session.alreadyGuessed = false;
    req.session.guesses.push(userInput);
  }
  let answer = req.session.word;
  let isCorrect = false;
  for (let i = 0; i < answer.length; i++) {
    if (userInput === answer[i]) {
      req.session.blankArr[i] = answer[i];
      req.session.blanksRemaining--;
      isCorrect = true;
    }
  };
  if (isCorrect) {
    req.session.correctCount++;
  } else {
    req.session.incorrectCount++;
    req.session.guessesRemaining--;
  }

  res.redirect('/');

});

app.get('/playagain', (req, res) => {
  req.session.difficultyChosen = false;
  req.session.guessesRemaining = 8;
  res.redirect('/');
});
//
// app.get('/addScore', (req, res) => {
//   res.render('add-score');
// });
//
// app.post('/scoreBoard', (req, res) => {
//   let name = req.body.name;
//   let image = req.body.image;
//   let score = req.session.score;
//   let user = Winner.create({
//     name,
//     image,
//     score
//   });
//   res.redirect('/scoreBoard');
// });
//
// app.get('/scoreBoard', (req, res) => {
//   Winner.find({}, (err, winners) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(winners);
//       res.render('score-board', winners);
//     }
//   });
// });

app.get('/:difficulty', (req, res) => {
  req.session.difficulty = req.params.difficulty;
  req.session.beginGame = true;
  req.session.difficultyChosen = true;
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Your app is running on PORT ${ port }.`);
});
