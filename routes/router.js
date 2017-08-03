const express = require('express');
const router = express.Router();
const Winner = require('../models/winners');

let postData = {};

router.get('/', (req, res) => {

  // GET A NEW WORD
  function getNewWord(min, max) {
    // CREATE A NEW WORD, CONVERT TO UPPERCSE, SPLIT TO AN ARRAY
    req.session.word = randomWords().toUpperCase().split('');
    // RUN RECURSIVELY UNTIL PARAMETERS ARE TRUE
    if (req.session.word.length < min || req.session.word.length > max) {
      getNewWord(min, max);
    }
    // USED TO INCREMENT THE USERS SCORE
    req.session.scoreDivider = req.session.word.length;
    // INITIAL USER SCORE
    req.session.score = 0;
  }

  // IF DIFFICULTY HAS NOT BEEN CHOSEN, THE GAME HAS NOT BEGUN
  if (req.session.difficultyChosen === false) {
    req.session.beginGame = false;
  };

  // IF THE GAME HAS BEGUN, DO THIS
  if (req.session.beginGame === true) {
    if (req.session.difficulty === 'easy') {
      // IF DIFF. IS EASY, GET A WORD BETWEEN 4 AND 6 LETTERS
      getNewWord(4, 6);
      // MAX SCORE FOR EASY IS 1500
      req.session.maxScore = 1500;
    } else if (req.session.difficulty === 'medium') {
      // IF DIFF. IS MEDIUM, GET A WORD BETWEEN 6 AND 8 LETTERS
      getNewWord(6, 8);
      // MAX SCORE FOR MEDIUM IS 2000
      req.session.maxScore = 2000;
    } else {
      // IF DIFF. IS HARD, GET A WORD OF 8 LETTERS OR MORE
      getNewWord(8);
      // MAX SCORE FOR HARD IS 2500
      req.session.maxScore = 2500;
    }
    // BEGIN GAME IS FALSE SO THIS FUNCTION DOES NOT CONTINUE TO RUN
    req.session.beginGame = false;
    req.session.playing = true;
    req.session.didWin = false;
    req.session.blankArr = [];
    // CREATE UNDERSCORES EQUAL IN NUMBER TO THE NUMBER OF LETTERS IN THE WORD
    req.session.word.forEach(function(letter) {
      req.session.blankArr.push('_');
    });
    req.session.blanksRemaining = req.session.blankArr.length;
    req.session.guesses = [];
    req.session.guessesRemaining = 8;
    req.session.alreadyGuessed = false;
    req.session.errorMessage = '';
  }

  function clearGame() {
    req.session.playing = false;
    req.session.word = '';
  }

  // IF ALL OF THE LETTERS IN THE WORD HAVE BEEN GUESSED
  if (req.session.blanksRemaining === 0) {
    // ROUND THE USER SCORE
    let score = Math.round(req.session.score);
    req.session.gameOverMsg = `You win! Your score is ${ score }. Do you want to play again or add your score to the leader board?`;
    req.session.didWin = true;
    clearGame();
  }

  // IF THE USER IS OUT OF GUESSES
  if (req.session.guessesRemaining === 0) {
    // JOIN THE ARRAY INTO A STRING
    let answer = req.session.word.join('');
    req.session.gameOverMsg = `You lose. The word was ${ answer }.`;
    clearGame();
  }

  res.render('index', req.session);

});

router.post('/guess', (req, res) => {
  let userInput = req.body.guess.toUpperCase();

  req.check('guess', 'Please enter one letter').notEmpty().isAlpha().len(1, 1);
  req.getValidationResult()
    .then(function(result) {
      if(result.isEmpty()) {
        req.session.errors = [];
        req.session.errorMessage = '';

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
          let answer = req.session.word;
          let isCorrect = false;
          for (let i = 0; i < answer.length; i++) {
            if (userInput === answer[i]) {
              req.session.blankArr[i] = answer[i];
              req.session.blanksRemaining--;
              req.session.score += Math.round(req.session.maxScore / req.session.scoreDivider);
              isCorrect = true;
            }
          };

          if (!isCorrect) {
            req.session.guessesRemaining--;
            req.session.scoreDivider++;
          }
          res.redirect('/');
        }
      } else {
        req.session.errors = result.array();
        req.session.errorMessage = req.session.errors[0].msg
        res.redirect('/');
      }
    })
});

router.get('/playagain', (req, res) => {
  req.session.difficultyChosen = false;
  req.session.guessesRemaining = 8;
  res.redirect('/');
});

router.get('/addScore', (req, res) => {
  res.render('add-score', postData);
});

router.post('/scoreboard', (req, res) => {
  let name = req.body.name;
  req.check('name', 'Please enter a name').notEmpty();
  req.getValidationResult()
  .then(function(result) {
    if (result.isEmpty()) {
      req.session.errors = [];
      let score = Math.round(req.session.score);
      if (score > req.session.maxScore) {
        score = req.session.maxScore;
      }
      let user = Winner.create({
        name,
        score
      });
      res.redirect('/scoreboard');
    } else {
      req.session.errors = result.array();
      res.render('add-score', req.session);
    }
  })
});

router.get('/scoreboard', (req, res) => {
  Winner.find({}, (err, winners) => {
    if (err) {
      console.log(err);
    } else {
      // SORT ARRAY FROM HIGH SCORE TO LOW SCORE
      winners.sort(function(a, b) {
        return b.score - a.score;
      });
      let data = {leaderboard: winners}
      res.render('score-board', data);
    }
  });
});

router.get('/:difficulty', (req, res) => {
  req.session.difficulty = req.params.difficulty;
  req.session.beginGame = true;
  req.session.difficultyChosen = true;
  res.redirect('/');
});

module.exports = router;
