const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  image: String,
  ingredients: Array,
  directions: Array,
  tags: Array
});

module.exports = mongoose.model('Recipe', recipeSchema);