const jwt = require("jsonwebtoken");
const ExtractJwt = require("passport-jwt").ExtractJwt;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'ik ben ajacied';

module.exports.generateToken = (user) => {

  var userInfo = {
    username: user.username,
    _id: user._id.toString()
  };

  return token = jwt.sign(userInfo, jwtOptions.secretOrKey, {
    expiresIn: 60 * 60 * 24 // expires in 24 hours
  });
};

