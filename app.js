const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      fs = require('file-system'),
      mustacheExpress = require('mustache-express'),
      words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

let port = process.env.PORT || 3000;

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'something'
}));

app.get('/', (req, res) => {

  if (req.session.word === '' || !req.session.word) {
    let index = Math.floor(Math.random() * words.length);
    req.session.word = words[index].toUpperCase().split('');
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

  if (req.session.blanksRemaining === 0) {
    res.redirect('/winner');
  }

  if (req.session.guessesRemaining === 0) {
    res.redirect('/loser');
  }

  res.redirect('/');

});

app.get('/winner', (req, res) => {
  let answer = req.session.word.join('');
  req.session.word = '';
  res.render('winner', { answer });
});

app.get('/loser', (req, res) => {
  let answer = req.session.word.join('');
  req.session.word = '';
  res.render('loser', { answer });
});

app.listen(port, () => {
  console.log(`Your app is running on PORT ${ port }.`);
});
