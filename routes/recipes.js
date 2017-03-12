const express = require("express");
const router = express.Router();
const Recipe = require("../models/recipe");
const passport = require("passport");


const checkRecipeOwnership = (req, res, next) => {
  if (passport.authenticate('jwt', {session: false})) {
    Recipe.findById(req.body._id, function (err, foundRecipe) {
      if (err) {
        res.json(err)
      } else {
        if (foundRecipe.author.id.equals(req.body.author.id)) {
          next();
        } else {
          console.log(err);
        }
      }
    });
  } else {
    console.log(err);
  }
};

router.get('/', (req, res) => {
  res.send("keep me awake...")
});

router.get('/recipes', (req, res, next) => {
  Recipe.find({}, (err, recipes) => {
    if (err) {
      return next(err);
    }
    res.json(recipes)
  })
});

router.post('/recipes', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  Recipe.create(req.body, (err, recipe) => {
    if (err) {
      return next(err);
    }
    else {
      recipe.author.username = req.body.username;
      recipe.author.id = req.body.userid;
      recipe.save();
      res.json(recipe);
    }
  })
});

router.put('/recipes', checkRecipeOwnership, (req, res, next) => {
  Recipe.findByIdAndUpdate(req.body._id, req.body, (err, updatedRecipe) => {
    if (err) {
      return next(err);
    }
    res.status(200)
  })
});

router.delete('/recipes', checkRecipeOwnership, (req, res, next) => {
  Recipe.findByIdAndRemove(req.body._id, (err) => {
    if (err) {
      return next(err);
    }
    res.status(200)
  })

});

module.exports = router;