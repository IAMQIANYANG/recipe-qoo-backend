const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  image: String,
  ingredients: Array,
  directions: Array,
  tags: Array,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);