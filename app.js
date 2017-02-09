const express = require("express");
const app = express();
const bodyParser  = require("body-parser");
const cors = require("cors");

const url = 'mongodb://localhost:27017/what-to-eat';

const mongoose = require('mongoose');
mongoose.connect(url);

app.use(cors());

app.use(bodyParser.json());


const recipeSchema = new mongoose.Schema({
  name: String,
  image: String,
  ingredients: Array,
  directions: Array,
  tags: Array
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Recipe.create({
//   name: "Spicy Chicken",
//   image: "http://cdn0.koreanbapsang.com/wp-content/uploads/2015/06/DSC_0947-e1434373804805.jpg",
//   ingredients: ["250g chicken", "spicy soy paste", "1 soy sauce", "Sichuan pepper", " 3 garlic" ],
//   directions: ["Wash chicken and cut into blocks", "Grind garlic", "Put cooking oil"],
//   tags: []
// }, function(err, recipe) {
//   if (err) console.log(err);
//   console.log(recipe)
// });

app.get('/recipes', (req, res) => {
  Recipe.find({}, (err, recipes) => {
    if (err) console.log(err);
    res.json(recipes)
  })
});

app.post('/recipes', (req, res) => {
  Recipe.create(req.body, (err, recipe) => {
    if (err) console.log(err);
    res.json(recipe);
  })
});

app.put('/recipes', (req, res) => {
  Recipe.findByIdAndUpdate(req.body._id, req.body, (err, updatedRecipe) => {
    if (err) console.log(err);
    res.statusCode(200)
  })
});

app.delete('/recipes', (req, res) => {
  Recipe.findByIdAndRemove(req.body._id, (err) => {
    if (err) console.log(err);
    res.statusCode(200)
  })
  
});

app.listen(3001, () => console.log("server has started!"));