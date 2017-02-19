const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const utility = require("../utility");


router.post('/register', function (req, res) {
  const body = req.body;
  const hash = bcrypt.hashSync(body.password.trim(), 10);
  const user = new User({
    username: body.username.trim(),
    password: hash
  });

  user.save(function (err, user) {
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

router.post('/users/login', function (req, res, next) {
  User
    .findOne({username: req.body.username})
    .exec(function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          error: true,
          message: 'Username or Password is Wrong'
        });
      }
      bcrypt.compare(req.body.password, user.password,
        function (err, valid) {
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

router.get('/users/me', function (req, res, next) {
  const token = req.get('Authorization');
  
  if (!token) {
    return res.status(401).json({message: 'Must pass token'});
  }
  
  jwt.verify(token, utility.jwtOptions.secretOrKey, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({message: 'Please sign in again!'})
    }
    
    User.findById(user._id, function (err, user) {
      if (err) throw err;
      res.json({
        user: {username: user.username, userid: user._id}
      });
    });
  });
});

module.exports = router;