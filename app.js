const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      expressValidator = require('express-validator'),
      session = require('express-session'),
      fs = require('file-system'),
      mongoose = require('mongoose');
      mustacheExpress = require('mustache-express'),
      randomWords = require('random-words'),
      words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

const router = require('./routes/router');

let port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/hangman');

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(expressValidator())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'something'
}));
app.use('/', router);

app.listen(port, () => {
  console.log(`Your app is running on PORT ${ port }.`);
});
