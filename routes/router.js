const express = require('express');
const router = express.Router();
const Winner = require('../models/winners');

let postData = {};

router.get('/', (req, res) => {

  function getNewWord(min, max) {
    req.session.word = randomWords().toUpperCase().split('');
    if (req.session.word.length < min || req.session.word.length > max) {
      getNewWord(min, max);
    }
    req.session.scoreDivider = req.session.word.length;
    req.session.score = 0;
  }

  if (req.session.difficultyChosen === false) {
    req.session.beginGame = false;
  };

  if (req.session.beginGame === true) {
    if (req.session.difficulty === 'easy') {
      getNewWord(4, 6);
      req.session.maxScore = 1500;
    } else if (req.session.difficulty === 'medium') {
      getNewWord(6, 8);
      req.session.maxScore = 2000;
    } else {
      getNewWord(8);
      req.session.maxScore = 2500;
    }
    req.session.beginGame = false;
    req.session.playing = true;
    req.session.didWin = false;
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

  function clearGame() {
    req.session.playing = false;
    req.session.word = '';
  }

  if (req.session.blanksRemaining === 0) {
    let score = Math.round(req.session.score);
    req.session.gameOverMsg = `You win! Your score is ${ score }. Do you want to play again or add your score to the leader board?`;
    req.session.didWin = true;
    clearGame();
  }

  if (req.session.guessesRemaining === 0) {
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

          if (isCorrect) {
            req.session.correctCount++;
          } else {
            req.session.incorrectCount++;
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
