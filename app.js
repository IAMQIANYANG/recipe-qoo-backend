const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");
const Recipe = require("./models/recipe");
const User = require("./models/user");
const utility = require("./utility");
const configure = require("./configure")

const app = express();

// mongodb://recipeqooowner:recipeqooowner@ds153719.mlab.com:53719/recipe-qoo
mongoose.connect(configure.mongodburl);

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.use(passport.initialize());


const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = configure.secretKey;

const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);

  User.findById(jwt_payload._id, function (err, user) {
    if (err) {
      return next(err, false);
    }
    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }

  });

});

passport.use(strategy);


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


const checkRecipeOwnership = (req, res, next) => {
  if(passport.authenticate('jwt', { session: false})){
    Recipe.findById(req.body._id, function(err, foundRecipe){
      if(err){
        console.log(err);
        res.json(err)
      }  else {
        if(foundRecipe.author.id.equals(req.body.author.id)) {
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

//recipes routes
app.get('/recipes', (req, res) => {
  Recipe.find({}, (err, recipes) => {
    if (err) console.log(err);
    res.json(recipes)
  })
});

app.post('/recipes', passport.authenticate('jwt', { session: false}), (req, res) => {
  Recipe.create(req.body, (err, recipe) => {
    if (err) console.log(err);
    else {
      recipe.author.username = req.body.username;
      recipe.author.id = req.body.userid;
      console.log(recipe.author)
      recipe.save();
      console.log(recipe)
      res.json(recipe);
    }
  })
});

app.put('/recipes', checkRecipeOwnership, (req, res) => {
  Recipe.findByIdAndUpdate(req.body._id, req.body, (err, updatedRecipe) => {
    if (err) console.log(err);
    res.status(200)
  })
});

app.delete('/recipes', checkRecipeOwnership, (req, res) => {
  Recipe.findByIdAndRemove(req.body._id, (err) => {
    if (err) console.log(err);
    res.status(200)
  })
  
});

app.post('/register', function(req, res, next) {
  const body = req.body;
  const hash = bcrypt.hashSync(body.password.trim(), 10);
  const user = new User({
    username: body.username.trim(),
    password: hash
  });
  
  user.save(function(err, user) { 
    if (err) {
      return res.status(401).json({
      error: true,
      message: 'Username has been used. Please try another one'
    });
    }
    
    const token = utility.generateToken(user);

    res.json({
      userInfo: {username: user.username, userid: user._id},
      token: token
  });
  });
});

app.post('/users/login', function(req, res) {
  User
    .findOne({username: req.body.username})
    .exec(function(err, user) {
      if (err) res.json(err);
      if (!user) {
        return res.status(401).json({
          error: true,
          message: 'Username or Password is Wrong'
      });
      }
      bcrypt.compare(req.body.password, user.password,
      function(err, valid) {
        if (!valid) {
          return res.status(401).json({
            error: true,
            message: 'Username or Password is Wrong'
        });
        }
        const token = utility.generateToken(user);
        res.json({
          userInfo: {username: user.username, userid: user._id},
          token: token
      });
      });
    });
});

//get current user from token
app.get('/users/me', function(req, res) {
  // check header or url parameters or post parameters for token
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({message: 'Must pass token'});
  }
// Check token that was passed by decoding token using secret
  jwt.verify(token, jwtOptions.secretOrKey, function(err, user) {
    if (err) console.log(err);
    //return user using the id from w/in JWTToken
    User.findById({
    '_id': user._id
  }, function(err, user) {
      if (err) throw err;
      res.json({
        user: {username: user.username, userid: user._id}
    });
    });
  });
});


app.listen(process.env.PORT, process.env.IP, () => console.log("server has started!"));