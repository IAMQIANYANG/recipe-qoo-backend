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

const app = express();

const url = 'mongodb://localhost:27017/what-to-eat';
mongoose.connect(url);

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.use(passport.initialize());


const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'ik ben ajacied';

const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);

  User.findOne({username: jwt_payload.username}, function (err, user) {
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

// app.use(function(req, res, next) {
//   let token = req.headers['authorization'];
//   if (!token) return next();
//
//   token = token.replace('Bearer ', '');
//
//   jwt.verify(token, jwtOptions.secretOrKey, function(err, user) {
//     if (err) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please register Log in using a valid email to submit posts'
//       });
//     } else {
//       req.user = user; //set the user to req so other routes can use it
//       next();
//     }
//   });
// });


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


//recipes routes
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
    res.status(200)
  })
});

app.delete('/recipes', (req, res) => {
  Recipe.findByIdAndRemove(req.body._id, (err) => {
    if (err) console.log(err);
    res.status(200)
  })
  
});

app.post('/register', function(req, res, next) {
  const body = req.body;
  const hash = bcrypt.hashSync(body.password.trim(), 10);
  var user = new User({
    username: body.username.trim(),
    password: hash
  });
  
  user.save(function(err, user) { 
    if (err) console.log(err);
    console.log(user);
    const token = utility.generateToken(user);

    res.json({
      userInfo: {username: user.username, userid: user._id},
      token: token
  });
  });
});

app.post('/users/login', function(req, res) {
  console.log(req.body)
  User
    .findOne({username: req.body.username})
    .exec(function(err, user) {
      if (err) throw err;
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
app.get('/me/from/token', function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(401).json({message: 'Must pass token'});
  }
// Check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
    if (err) throw err;
    //return user using the id from w/in JWTToken
    User.findById({
    '_id': user._id
  }, function(err, user) {
      if (err) throw err;
      res.json({
        user: {username: user.username, userid: user._id},
        token: token
    });
    });
  });
});


app.listen(3001, () => console.log("server has started!"));