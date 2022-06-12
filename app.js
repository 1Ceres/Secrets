require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const md5 = require('md5');
const enc = require('./enc.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 3000;


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", () => console.log("MongoDB connected on 27017"));

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});


//encryption added before model, as it uses schema, where password is decripted using a key from outside file (.gitignore)
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password'] });



const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
  const newUser = new User({
    email: req.body.username,
    password: hash
  });
  newUser.save(function(err) {
    if (err) {
      res.send(err);
    } else {
      res.render("secrets");
    }
  });
});
});

app.post("/login", function(req, res) {
  const user = req.body.username;
  const pass = req.body.password;

  User.findOne({
    email: user
  }, function(err, foundUser) {
    if (err) {
      res.send(err);
    } else {
      if (foundUser) {
      //  if (foundUser.password === pass) {
      bcrypt.compare(pass, foundUser.password, function(err, result){
        if (result === true){
          res.render("secrets");
        } else {
          res.send("Wrong password, Try again");
        }
      });
      } else {
        res.send("User not recognized, please register");
      }
    }
  });

});







app.listen(port, () => console.log("Server is up and running on port: " + port));
