const mongoose = require('mongoose');

let winnerSchema = new mongoose.Schema({
  name: String,
  score: Number
});

let Winner = mongoose.model('Winner', winnerSchema);

module.exports = Winner;
