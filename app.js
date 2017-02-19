const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const utility = require("./utility");
const configure = require("./configure");
const recipesRoutes = require("./routes/recipes");
const usersRoutes = require("./routes/users");

const app = express();

mongoose.connect(configure.mongodburl);

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.use(passport.initialize());
passport.use(utility.strategy);

app.use(recipesRoutes);
app.use(usersRoutes);

app.listen(process.env.PORT, process.env.IP, () => console.log("server has started!"));
