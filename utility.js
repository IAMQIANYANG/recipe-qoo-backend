const jwt = require("jsonwebtoken");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const configure = require("./configure");
const JwtStrategy = require("passport-jwt").Strategy;
const User = require("./models/user");

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = configure.secretKey;

module.exports.jwtOptions = jwtOptions;

module.exports.generateToken = (user) => {

  var userInfo = {
    username: user.username,
    _id: user._id.toString()
  };

  return token = jwt.sign(userInfo, jwtOptions.secretOrKey, {
    expiresIn: 60 * 60 * 24 // expires in 24 hours
  });
};

module.exports.strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
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

